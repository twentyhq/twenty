import { isNonEmptyString, isNonNegativeInteger } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  AppConnectionAuthFailedError,
  getConnection,
  kv,
  RetryableLogicFunctionError,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { FEATURE_FLAGS } from 'src/constants/feature-flags';
import { TEAMS_TRANSCRIPT_HISTORY_IMPORT_PAGE_DELAY_MILLISECONDS } from 'src/features/transcripts/constants/teams-transcript-history-import-page-delay-milliseconds';
import { TRANSCRIPTS_ENABLED_APPLICATION_VARIABLE_KEY } from 'src/features/transcripts/constants/transcripts-enabled-application-variable-key';
import { GRAPH_ACCESS_TO_TRANSCRIPTS_DISABLED_ERROR_CODE } from 'src/features/transcripts/logic-functions/constants/graph-access-to-transcripts-disabled-error-code';
import { TEAMS_TRANSCRIPT_HISTORY_RETRY_DELAYS_MILLISECONDS } from 'src/features/transcripts/logic-functions/constants/teams-transcript-history-retry-delays-milliseconds';
import { GraphRequestError } from 'src/features/transcripts/logic-functions/types/graph-request-error';
import { type TeamsTranscriptHistoryJobPayload } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-job-payload.type';
import { type TeamsTranscriptHistoryPageResult } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-page-result.type';
import { type TeamsTranscriptHistoryState } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-state.type';
import { buildTeamsCalendarViewUrl } from 'src/features/transcripts/logic-functions/utils/build-teams-calendar-view-url';
import { buildTeamsTranscriptHistoryKvKey } from 'src/features/transcripts/logic-functions/utils/build-teams-transcript-history-kv-key';
import { enqueueTeamsTranscriptHistoryJobOrThrow } from 'src/features/transcripts/logic-functions/utils/enqueue-teams-transcript-history-job-or-throw';
import { importTeamsTranscriptHistoryPageOrThrow } from 'src/features/transcripts/logic-functions/utils/import-teams-transcript-history-page-or-throw';
import { listTeamsCalendarPage } from 'src/features/transcripts/logic-functions/utils/list-teams-calendar-page';
import { listTeamsOccurrenceTranscripts } from 'src/features/transcripts/logic-functions/utils/list-teams-occurrence-transcripts';
import { resolveTeamsCalendarNextPageUrlOrThrow } from 'src/features/transcripts/logic-functions/utils/resolve-teams-calendar-next-page-url-or-throw';
import { toErrorMessage } from 'src/utils/to-error-message';
import { isFeatureEnabled } from 'src/utils/is-feature-enabled';

const findStateForJob = async (
  job: TeamsTranscriptHistoryJobPayload,
): Promise<TeamsTranscriptHistoryState | undefined> => {
  const state = await kv.get<TeamsTranscriptHistoryState>(
    buildTeamsTranscriptHistoryKvKey(job.connectedAccountId),
  );

  return state?.runId === job.runId && state.phase === 'importing'
    ? state
    : undefined;
};

const isFatalError = (error: unknown): boolean =>
  error instanceof AppConnectionAuthFailedError ||
  (error instanceof GraphRequestError &&
    error.status === 403 &&
    error.innerErrorCode === GRAPH_ACCESS_TO_TRANSCRIPTS_DISABLED_ERROR_CODE);

const importPageOrThrow = async (
  job: TeamsTranscriptHistoryJobPayload,
): Promise<TeamsTranscriptHistoryPageResult> => {
  const state = await findStateForJob(job);

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

  const { accessToken } = await getConnection(job.connectedAccountId);
  const page = await listTeamsCalendarPage({
    accessToken,
    url: isDefined(job.nextPageUrl)
      ? resolveTeamsCalendarNextPageUrlOrThrow(job.nextPageUrl)
      : buildTeamsCalendarViewUrl({
          startDateTime: state.windowStart,
          endDateTime: state.windowEnd,
        }),
  });
  const importedCount = await importTeamsTranscriptHistoryPageOrThrow({
    accessToken,
    coreApiClient: new CoreApiClient({ runAs: 'application' }),
    transcripts: await listTeamsOccurrenceTranscripts({
      accessToken,
      occurrences: page.occurrences,
    }),
  });
  const currentState = await findStateForJob(job);

  if (!isDefined(currentState) || currentState.pageCount !== job.pageIndex) {
    return {
      success: true,
      skipped: true,
      reason: 'Teams transcript history run moved on during this page',
    };
  }

  const nextJob = isNonEmptyString(page.nextPageUrl)
    ? {
        ...job,
        pageIndex: job.pageIndex + 1,
        attempt: 0,
        nextPageUrl: page.nextPageUrl,
      }
    : undefined;

  await kv.set<TeamsTranscriptHistoryState>(
    buildTeamsTranscriptHistoryKvKey(job.connectedAccountId),
    {
      ...currentState,
      phase: isDefined(nextJob) ? 'importing' : 'imported',
      pageCount: job.pageIndex + 1,
      updatedAt: new Date().toISOString(),
      nextJob,
    },
  );

  if (isDefined(nextJob)) {
    await enqueueTeamsTranscriptHistoryJobOrThrow({
      job: nextJob,
      delayMilliseconds:
        importedCount > 0
          ? TEAMS_TRANSCRIPT_HISTORY_IMPORT_PAGE_DELAY_MILLISECONDS
          : 0,
    });
  }

  return { success: true };
};

const retryOrFailPageOrThrow = async ({
  job,
  error,
}: {
  job: TeamsTranscriptHistoryJobPayload;
  error: unknown;
}): Promise<TeamsTranscriptHistoryPageResult> => {
  const state = await findStateForJob(job);

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
      updatedAt: new Date().toISOString(),
    });

    return { success: false, error: toErrorMessage(error) };
  }

  await kv.set<TeamsTranscriptHistoryState>(stateKvKey, {
    ...state,
    updatedAt: new Date().toISOString(),
  });
  await enqueueTeamsTranscriptHistoryJobOrThrow({
    job: { ...job, attempt: job.attempt + 1 },
    delayMilliseconds: retryDelayMilliseconds,
  });

  return { success: true, retryScheduled: true };
};

export const processTeamsTranscriptHistoryPageOrThrow = async (
  payload: Partial<Record<keyof TeamsTranscriptHistoryJobPayload, unknown>>,
): Promise<TeamsTranscriptHistoryPageResult> => {
  const { connectedAccountId, runId, pageIndex, attempt, nextPageUrl } =
    payload;

  if (
    !isNonEmptyString(connectedAccountId) ||
    !isNonEmptyString(runId) ||
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
    pageIndex,
    attempt,
    ...(isNonEmptyString(nextPageUrl) ? { nextPageUrl } : {}),
  };

  try {
    return await importPageOrThrow(job);
  } catch (error) {
    if (error instanceof RetryableLogicFunctionError) {
      throw error;
    }

    console.error(
      `[teams] failed transcript history page ${job.pageIndex} of run ${job.runId} for connected account ${job.connectedAccountId}: ${toErrorMessage(error)}`,
    );

    try {
      return await retryOrFailPageOrThrow({ job, error });
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
