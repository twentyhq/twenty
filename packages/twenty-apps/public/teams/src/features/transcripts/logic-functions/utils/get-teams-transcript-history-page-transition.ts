import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_TRANSCRIPT_HISTORY_MAX_IMPORT_COUNT } from 'src/features/transcripts/constants/teams-transcript-history-max-import-count';
import { TEAMS_TRANSCRIPT_HISTORY_MAX_PAGES } from 'src/features/transcripts/logic-functions/constants/teams-transcript-history-max-pages';
import { type TeamsTranscriptHistoryJobPayload } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-job-payload.type';
import { type TeamsTranscriptHistoryPageCounts } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-page-counts.type';
import { type TeamsTranscriptHistoryRunningPhase } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-running-phase.type';
import { type TeamsTranscriptHistoryState } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-state.type';
import { getTeamsTranscriptHistoryChunkWindow } from 'src/features/transcripts/logic-functions/utils/get-teams-transcript-history-chunk-window';
import { getTeamsTranscriptHistoryToImportCount } from 'src/features/transcripts/utils/get-teams-transcript-history-to-import-count';

const getNextJob = ({
  state,
  job,
  nextPageUrl,
}: {
  state: TeamsTranscriptHistoryState;
  job: TeamsTranscriptHistoryJobPayload;
  nextPageUrl?: string;
}): TeamsTranscriptHistoryJobPayload | undefined => {
  if (isNonEmptyString(nextPageUrl)) {
    return {
      ...job,
      pageIndex: job.pageIndex + 1,
      attempt: 0,
      nextPageUrl,
    };
  }

  const nextChunkIndex = job.chunkIndex + 1;

  return isDefined(
    getTeamsTranscriptHistoryChunkWindow({
      windowStart: state.windowStart,
      windowEnd: state.windowEnd,
      chunkIndex: nextChunkIndex,
    }),
  )
    ? {
        connectedAccountId: job.connectedAccountId,
        runId: job.runId,
        chunkIndex: nextChunkIndex,
        pageIndex: job.pageIndex + 1,
        attempt: 0,
      }
    : undefined;
};

const getPhaseAfterPage = ({
  phase,
  nextJob,
  importedCount,
  isImportLimitReachedOnPage,
  isCountedRun,
}: {
  phase: TeamsTranscriptHistoryRunningPhase;
  nextJob: TeamsTranscriptHistoryJobPayload | undefined;
  importedCount: number;
  isImportLimitReachedOnPage: boolean;
  isCountedRun: boolean;
}): Pick<
  TeamsTranscriptHistoryState,
  'phase' | 'errorCode' | 'isImportLimitReached'
> => {
  if (
    phase === 'importing' &&
    importedCount >= TEAMS_TRANSCRIPT_HISTORY_MAX_IMPORT_COUNT
  ) {
    // A counted run is refused above the limit, so reaching it means everything counted is in.
    return isImportLimitReachedOnPage || (isDefined(nextJob) && !isCountedRun)
      ? { phase: 'imported', isImportLimitReached: true }
      : { phase: 'imported' };
  }

  if (!isDefined(nextJob)) {
    return { phase: phase === 'counting' ? 'counted' : 'imported' };
  }

  if (nextJob.pageIndex >= TEAMS_TRANSCRIPT_HISTORY_MAX_PAGES) {
    return { phase: 'failed', errorCode: 'page-limit-reached' };
  }

  return { phase };
};

export const getTeamsTranscriptHistoryPageTransition = ({
  state,
  job,
  phase,
  pageCounts,
  isImportLimitReachedOnPage,
  nextPageUrl,
  now,
}: {
  state: TeamsTranscriptHistoryState;
  job: TeamsTranscriptHistoryJobPayload;
  phase: TeamsTranscriptHistoryRunningPhase;
  pageCounts: TeamsTranscriptHistoryPageCounts;
  isImportLimitReachedOnPage: boolean;
  nextPageUrl?: string;
  now: number;
}): {
  state: TeamsTranscriptHistoryState;
  nextJob?: TeamsTranscriptHistoryJobPayload;
} => {
  const nextJob = getNextJob({ state, job, nextPageUrl });
  const importedCount = state.importedCount + pageCounts.importedCount;
  const phaseAfterPage = getPhaseAfterPage({
    phase,
    nextJob,
    importedCount,
    isImportLimitReachedOnPage,
    isCountedRun: getTeamsTranscriptHistoryToImportCount(state) > 0,
  });

  return {
    state: {
      ...state,
      ...phaseAfterPage,
      transcriptCount: state.transcriptCount + pageCounts.transcriptCount,
      alreadyImportedCount:
        state.alreadyImportedCount + pageCounts.alreadyImportedCount,
      deletedCount: state.deletedCount + pageCounts.deletedCount,
      importedCount,
      skippedCount: state.skippedCount + pageCounts.skippedCount,
      unavailableCount: state.unavailableCount + pageCounts.unavailableCount,
      pageCount: job.pageIndex + 1,
      // A page the import limit cut short was not fully checked.
      checkedThrough:
        isNonEmptyString(nextPageUrl) || phaseAfterPage.isImportLimitReached
          ? state.checkedThrough
          : getTeamsTranscriptHistoryChunkWindow({
              windowStart: state.windowStart,
              windowEnd: state.windowEnd,
              chunkIndex: job.chunkIndex,
            })?.startDateTime,
      updatedAt: new Date(now).toISOString(),
    },
    ...(phaseAfterPage.phase === phase ? { nextJob } : {}),
  };
};
