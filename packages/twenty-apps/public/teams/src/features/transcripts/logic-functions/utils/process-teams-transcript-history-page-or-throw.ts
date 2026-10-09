import { isNonEmptyString, isNonNegativeInteger } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  getConnection,
  kv,
  RetryableLogicFunctionError,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { FEATURE_FLAGS } from 'src/constants/feature-flags';
import { TEAMS_TRANSCRIPT_HISTORY_IMPORT_PAGE_DELAY_MILLISECONDS } from 'src/features/transcripts/constants/teams-transcript-history-import-page-delay-milliseconds';
import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
import { type TeamsTranscriptHistoryJobPayload } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-job-payload.type';
import { type TeamsTranscriptHistoryPageResult } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-page-result.type';
import { type TeamsTranscriptHistoryRunningPhase } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-running-phase.type';
import { buildTeamsCalendarViewUrl } from 'src/features/transcripts/logic-functions/utils/build-teams-calendar-view-url';
import { buildTeamsTranscriptHistoryKvKey } from 'src/features/transcripts/logic-functions/utils/build-teams-transcript-history-kv-key';
import { countTeamsTranscriptHistoryPageOrThrow } from 'src/features/transcripts/logic-functions/utils/count-teams-transcript-history-page-or-throw';
import { enqueueTeamsTranscriptHistoryJobOrThrow } from 'src/features/transcripts/logic-functions/utils/enqueue-teams-transcript-history-job-or-throw';
import { findTeamsTranscriptHistoryStateForJob } from 'src/features/transcripts/logic-functions/utils/find-teams-transcript-history-state-for-job';
import { getTeamsTranscriptHistoryChunkWindow } from 'src/features/transcripts/logic-functions/utils/get-teams-transcript-history-chunk-window';
import { getTeamsTranscriptHistoryPageTransition } from 'src/features/transcripts/logic-functions/utils/get-teams-transcript-history-page-transition';
import { importTeamsTranscriptHistoryPageOrThrow } from 'src/features/transcripts/logic-functions/utils/import-teams-transcript-history-page-or-throw';
import { isTeamsMeetingOccurrenceStartingInWindow } from 'src/features/transcripts/logic-functions/utils/is-teams-meeting-occurrence-starting-in-window';
import { listTeamsCalendarPage } from 'src/features/transcripts/logic-functions/utils/list-teams-calendar-page';
import { listTeamsOccurrenceTranscripts } from 'src/features/transcripts/logic-functions/utils/list-teams-occurrence-transcripts';
import { resolveTeamsCalendarNextPageUrlOrThrow } from 'src/features/transcripts/logic-functions/utils/resolve-teams-calendar-next-page-url-or-throw';
import { retryOrFailTeamsTranscriptHistoryPageOrThrow } from 'src/features/transcripts/logic-functions/utils/retry-or-fail-teams-transcript-history-page-or-throw';
import { toErrorMessage } from 'src/features/transcripts/logic-functions/utils/to-error-message';
import { isFeatureEnabled } from 'src/utils/is-feature-enabled';

const processValidTeamsTranscriptHistoryPageOrThrow = async ({
  job,
  phase,
}: {
  job: TeamsTranscriptHistoryJobPayload;
  phase: TeamsTranscriptHistoryRunningPhase;
}): Promise<TeamsTranscriptHistoryPageResult> => {
  const state = await findTeamsTranscriptHistoryStateForJob({ job, phase });

  if (
    !isDefined(state) ||
    (state.pageCount !== job.pageIndex && state.pageCount !== job.pageIndex + 1)
  ) {
    return {
      success: true,
      skipped: true,
      reason: 'Teams transcript history run moved on without this page',
    };
  }

  const chunkWindow = getTeamsTranscriptHistoryChunkWindow({
    windowStart: state.windowStart,
    windowEnd: state.windowEnd,
    chunkIndex: job.chunkIndex,
  });

  if (!isDefined(chunkWindow)) {
    return { success: false, error: 'Invalid Teams transcript history job' };
  }

  const { accessToken } = await getConnection(job.connectedAccountId);
  const page = await listTeamsCalendarPage({
    accessToken,
    url: isDefined(job.nextPageUrl)
      ? resolveTeamsCalendarNextPageUrlOrThrow(job.nextPageUrl)
      : buildTeamsCalendarViewUrl(chunkWindow),
  });
  const transcripts = await listTeamsOccurrenceTranscripts({
    accessToken,
    occurrences: page.occurrences.filter((occurrence) =>
      isTeamsMeetingOccurrenceStartingInWindow({
        occurrence,
        window: chunkWindow,
      }),
    ),
  });
  const coreApiClient = new CoreApiClient({ runAs: 'application' });
  const pageCounts =
    phase === 'counting'
      ? await countTeamsTranscriptHistoryPageOrThrow({
          coreApiClient,
          transcripts,
        })
      : await importTeamsTranscriptHistoryPageOrThrow({
          accessToken,
          coreApiClient,
          transcripts,
        });
  const currentState = await findTeamsTranscriptHistoryStateForJob({
    job,
    phase,
  });

  if (!isDefined(currentState)) {
    return {
      success: true,
      skipped: true,
      reason: 'Teams transcript history run was replaced or removed',
    };
  }

  const transition = getTeamsTranscriptHistoryPageTransition({
    state: currentState,
    job,
    phase,
    pageCounts,
    nextPageUrl: page.nextPageUrl,
    now: Date.now(),
  });

  if (isDefined(transition.state)) {
    await kv.set(
      buildTeamsTranscriptHistoryKvKey(job.connectedAccountId),
      transition.state,
    );
  }

  if (isDefined(transition.nextJob)) {
    await enqueueTeamsTranscriptHistoryJobOrThrow({
      phase,
      job: transition.nextJob,
      delayMilliseconds:
        pageCounts.importedCount > 0
          ? TEAMS_TRANSCRIPT_HISTORY_IMPORT_PAGE_DELAY_MILLISECONDS
          : 0,
    });
  }

  return {
    success: true,
    transcriptCount: transcripts.length,
    isRunComplete: !isDefined(transition.nextJob),
  };
};

export const processTeamsTranscriptHistoryPageOrThrow = async ({
  phase,
  payload,
}: {
  phase: TeamsTranscriptHistoryRunningPhase;
  payload: Partial<Record<keyof TeamsTranscriptHistoryJobPayload, unknown>>;
}): Promise<TeamsTranscriptHistoryPageResult> => {
  const {
    connectedAccountId,
    runId,
    chunkIndex,
    pageIndex,
    attempt,
    nextPageUrl,
  } = payload;

  if (
    !isNonEmptyString(connectedAccountId) ||
    !isNonEmptyString(runId) ||
    !isNonNegativeInteger(chunkIndex) ||
    !isNonNegativeInteger(pageIndex) ||
    !isNonNegativeInteger(attempt) ||
    (isDefined(nextPageUrl) && !isNonEmptyString(nextPageUrl))
  ) {
    return { success: false, error: 'Invalid Teams transcript history job' };
  }

  if (
    !isFeatureEnabled({
      isAvailable: FEATURE_FLAGS.IS_TRANSCRIPT_IMPORT_ENABLED,
      settingValue: process.env[TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY],
    })
  ) {
    return {
      success: true,
      skipped: true,
      reason: 'Teams transcripts are not enabled',
    };
  }

  const job: TeamsTranscriptHistoryJobPayload = {
    connectedAccountId,
    runId,
    chunkIndex,
    pageIndex,
    attempt,
    ...(isNonEmptyString(nextPageUrl) ? { nextPageUrl } : {}),
  };

  try {
    return await processValidTeamsTranscriptHistoryPageOrThrow({ job, phase });
  } catch (error) {
    if (error instanceof RetryableLogicFunctionError) {
      throw error;
    }

    console.error(
      `[teams] failed transcript history page ${job.pageIndex} of run ${job.runId} for connected account ${job.connectedAccountId}: ${toErrorMessage(error)}`,
    );

    return retryOrFailTeamsTranscriptHistoryPageOrThrow({ job, phase, error });
  }
};
