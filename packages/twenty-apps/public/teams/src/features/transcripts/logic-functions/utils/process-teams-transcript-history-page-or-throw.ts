import { isNonEmptyString, isNonNegativeInteger } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  AppConnectionAuthFailedError,
  getConnection,
  kv,
  RetryableLogicFunctionError,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { RELEASE_FLAGS } from 'src/constants/release-flags';
import { TEAMS_TRANSCRIPT_HISTORY_IMPORT_PAGE_DELAY_MILLISECONDS } from 'src/features/transcripts/constants/teams-transcript-history-import-page-delay-milliseconds';
import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
import { GRAPH_ACCESS_TO_TRANSCRIPTS_DISABLED_ERROR_CODE } from 'src/features/transcripts/logic-functions/constants/graph-access-to-transcripts-disabled-error-code';
import { TEAMS_TRANSCRIPT_HISTORY_RETRY_DELAYS_MILLISECONDS } from 'src/features/transcripts/logic-functions/constants/teams-transcript-history-retry-delays-milliseconds';
import { GraphRequestError } from 'src/features/transcripts/logic-functions/types/graph-request-error';
import { type TeamsTranscriptHistoryErrorCode } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-error-code.type';
import { type TeamsTranscriptHistoryJobPayload } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-job-payload.type';
import { type TeamsTranscriptHistoryPageResult } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-page-result.type';
import { type TeamsTranscriptHistoryRunningPhase } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-running-phase.type';
import { type TeamsTranscriptHistoryState } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-state.type';
import { buildTeamsCalendarViewUrl } from 'src/features/transcripts/logic-functions/utils/build-teams-calendar-view-url';
import { buildTeamsTranscriptHistoryKvKey } from 'src/features/transcripts/logic-functions/utils/build-teams-transcript-history-kv-key';
import { deleteTeamsTranscriptHistoryKvKeys } from 'src/features/transcripts/logic-functions/utils/delete-teams-transcript-history-kv-keys';
import { countTeamsTranscriptHistoryPageOrThrow } from 'src/features/transcripts/logic-functions/utils/count-teams-transcript-history-page-or-throw';
import { enqueueTeamsTranscriptHistoryJobOrThrow } from 'src/features/transcripts/logic-functions/utils/enqueue-teams-transcript-history-job-or-throw';
import { getTeamsTranscriptHistoryChunkWindow } from 'src/features/transcripts/logic-functions/utils/get-teams-transcript-history-chunk-window';
import { getTeamsTranscriptHistoryPageTransition } from 'src/features/transcripts/logic-functions/utils/get-teams-transcript-history-page-transition';
import { importTeamsTranscriptHistoryPageOrThrow } from 'src/features/transcripts/logic-functions/utils/import-teams-transcript-history-page-or-throw';
import { isTeamsConnectionListed } from 'src/features/transcripts/logic-functions/utils/is-teams-connection-listed';
import { isTeamsMeetingOccurrenceStartingInWindow } from 'src/features/transcripts/logic-functions/utils/is-teams-meeting-occurrence-starting-in-window';
import { listTeamsCalendarPage } from 'src/features/transcripts/logic-functions/utils/list-teams-calendar-page';
import { listTeamsOccurrenceTranscripts } from 'src/features/transcripts/logic-functions/utils/list-teams-occurrence-transcripts';
import { resolveTeamsCalendarNextPageUrlOrThrow } from 'src/features/transcripts/logic-functions/utils/resolve-teams-calendar-next-page-url-or-throw';
import { toErrorMessage } from 'src/utils/to-error-message';
import { isFeatureEnabled } from 'src/utils/is-feature-enabled';

type TeamsTranscriptHistoryPageJob = {
  job: TeamsTranscriptHistoryJobPayload;
  phase: TeamsTranscriptHistoryRunningPhase;
};

const findStateForJob = async ({
  job,
  phase,
}: TeamsTranscriptHistoryPageJob): Promise<
  TeamsTranscriptHistoryState | undefined
> => {
  const state = await kv.get<TeamsTranscriptHistoryState>(
    buildTeamsTranscriptHistoryKvKey(job.connectedAccountId),
  );

  return state?.runId === job.runId && state.phase === phase
    ? state
    : undefined;
};

const isFatalError = (error: unknown): boolean =>
  error instanceof AppConnectionAuthFailedError ||
  (error instanceof GraphRequestError &&
    error.status === 403 &&
    error.innerErrorCode === GRAPH_ACCESS_TO_TRANSCRIPTS_DISABLED_ERROR_CODE);

const getFailureErrorCode = (
  error: unknown,
): TeamsTranscriptHistoryErrorCode => {
  if (
    error instanceof AppConnectionAuthFailedError ||
    (error instanceof GraphRequestError && error.status === 401)
  ) {
    return 'reconnect-required';
  }

  return isFatalError(error) ? 'transcripts-disabled-by-admin' : 'unknown';
};

const processPageOrThrow = async ({
  job,
  phase,
}: TeamsTranscriptHistoryPageJob): Promise<TeamsTranscriptHistoryPageResult> => {
  const state = await findStateForJob({ job, phase });

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

  // The page was already saved, so only scheduling the next page failed.
  if (state.pageCount === job.pageIndex + 1) {
    if (isDefined(state.nextJob)) {
      await enqueueTeamsTranscriptHistoryJobOrThrow({
        phase,
        job: state.nextJob,
        delayMilliseconds: 0,
      });
    }

    return {
      success: true,
      skipped: true,
      reason: 'Teams transcript history page was already imported',
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
  const { transcripts, unavailableMeetingCount } =
    await listTeamsOccurrenceTranscripts({
      accessToken,
      occurrences: page.occurrences.filter((occurrence) =>
        isTeamsMeetingOccurrenceStartingInWindow({
          occurrence,
          window: chunkWindow,
        }),
      ),
    });
  const coreApiClient = new CoreApiClient({ runAs: 'application' });
  const phaseCounts =
    phase === 'counting'
      ? await countTeamsTranscriptHistoryPageOrThrow({
          coreApiClient,
          transcripts,
        })
      : await importTeamsTranscriptHistoryPageOrThrow({
          accessToken,
          coreApiClient,
          transcripts,
          importedSince: state.windowEnd,
          isRunActive: async () =>
            isDefined(await findStateForJob({ job, phase })),
        });
  const pageCounts = {
    ...phaseCounts,
    unavailableCount: phaseCounts.unavailableCount + unavailableMeetingCount,
  };
  const currentState = await findStateForJob({ job, phase });

  if (!isDefined(currentState) || currentState.pageCount !== job.pageIndex) {
    return {
      success: true,
      skipped: true,
      reason: 'Teams transcript history run moved on during this page',
    };
  }

  const { state: nextState, nextJob } = getTeamsTranscriptHistoryPageTransition(
    {
      state: currentState,
      job,
      phase,
      pageCounts,
      nextPageUrl: page.nextPageUrl,
      now: Date.now(),
    },
  );

  await kv.set<TeamsTranscriptHistoryState>(
    buildTeamsTranscriptHistoryKvKey(job.connectedAccountId),
    { ...nextState, nextJob },
  );

  // Disconnecting deletes the run state, and kv cannot make this save conditional on it.
  if (!(await isTeamsConnectionListed(job.connectedAccountId))) {
    await deleteTeamsTranscriptHistoryKvKeys({
      connectedAccountId: job.connectedAccountId,
    });

    return {
      success: true,
      skipped: true,
      reason: 'Teams connection was removed during this page',
    };
  }

  if (isDefined(nextJob)) {
    await enqueueTeamsTranscriptHistoryJobOrThrow({
      phase,
      job: nextJob,
      delayMilliseconds:
        pageCounts.importedCount > 0
          ? TEAMS_TRANSCRIPT_HISTORY_IMPORT_PAGE_DELAY_MILLISECONDS
          : 0,
    });
  }

  return { success: true };
};

const retryOrFailPageOrThrow = async ({
  job,
  phase,
  error,
}: TeamsTranscriptHistoryPageJob & {
  error: unknown;
}): Promise<TeamsTranscriptHistoryPageResult> => {
  const state = await findStateForJob({ job, phase });

  if (!isDefined(state)) {
    return {
      success: true,
      skipped: true,
      reason: 'Teams transcript history run was replaced or removed',
    };
  }

  const stateKvKey = buildTeamsTranscriptHistoryKvKey(job.connectedAccountId);
  const retryDelayMilliseconds =
    TEAMS_TRANSCRIPT_HISTORY_RETRY_DELAYS_MILLISECONDS[job.attempt];

  if (isFatalError(error) || !isDefined(retryDelayMilliseconds)) {
    await kv.set<TeamsTranscriptHistoryState>(stateKvKey, {
      ...state,
      phase: 'failed',
      errorCode: getFailureErrorCode(error),
      updatedAt: new Date().toISOString(),
    });

    return { success: false, error: toErrorMessage(error) };
  }

  await kv.set<TeamsTranscriptHistoryState>(stateKvKey, {
    ...state,
    updatedAt: new Date().toISOString(),
  });
  await enqueueTeamsTranscriptHistoryJobOrThrow({
    phase,
    job: { ...job, attempt: job.attempt + 1 },
    delayMilliseconds: retryDelayMilliseconds,
  });

  return { success: true, retryScheduled: true };
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
      isAvailable: RELEASE_FLAGS.IS_TRANSCRIPT_IMPORT_RELEASED,
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
    return await processPageOrThrow({ job, phase });
  } catch (error) {
    if (error instanceof RetryableLogicFunctionError) {
      throw error;
    }

    console.error(
      `[teams] failed transcript history page ${job.pageIndex} of run ${job.runId} for connected account ${job.connectedAccountId}: ${toErrorMessage(error)}`,
    );

    try {
      return await retryOrFailPageOrThrow({ job, phase, error });
    } catch (recoveryError) {
      if (recoveryError instanceof RetryableLogicFunctionError) {
        throw recoveryError;
      }

      throw new RetryableLogicFunctionError(
        `Could not record the failure of Teams transcript history page ${job.pageIndex}: ${toErrorMessage(recoveryError)}`,
      );
    }
  }
};
