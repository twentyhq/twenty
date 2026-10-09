import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_TRANSCRIPT_HISTORY_IMPORT_PAGE_DELAY_MILLISECONDS } from 'src/features/transcripts/constants/teams-transcript-history-import-page-delay-milliseconds';
import { MILLISECONDS_PER_MINUTE } from 'src/features/transcripts/front-components/constants/milliseconds-per-minute';
import { MINUTES_PER_HOUR } from 'src/features/transcripts/front-components/constants/minutes-per-hour';
import { type TeamsTranscriptHistoryImportEstimate } from 'src/features/transcripts/front-components/types/teams-transcript-history-import-estimate.type';
import { type TeamsTranscriptHistoryView } from 'src/features/transcripts/front-components/types/teams-transcript-history-view.type';
import { type TeamsTranscriptHistoryState } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-state.type';

const getImportEstimate = (
  pageCount: number,
): TeamsTranscriptHistoryImportEstimate => {
  const importMinutes = Math.max(
    1,
    Math.ceil(
      (pageCount * TEAMS_TRANSCRIPT_HISTORY_IMPORT_PAGE_DELAY_MILLISECONDS) /
        MILLISECONDS_PER_MINUTE,
    ),
  );

  return importMinutes < MINUTES_PER_HOUR
    ? { unit: 'minute', count: importMinutes }
    : { unit: 'hour', count: Math.ceil(importMinutes / MINUTES_PER_HOUR) };
};

export const getTeamsTranscriptHistoryView = ({
  state,
  isStalled,
}: {
  state: TeamsTranscriptHistoryState | null;
  isStalled: boolean;
}): TeamsTranscriptHistoryView => {
  if (!isDefined(state)) {
    return { kind: 'idle' };
  }

  if (isStalled) {
    return { kind: 'stalled' };
  }

  const toImportCount =
    state.transcriptCount - state.alreadyImportedCount - state.deletedCount;

  switch (state.phase) {
    case 'counting':
      return { kind: 'counting', checkedThrough: state.checkedThrough };
    case 'counted':
      return {
        kind: 'counted',
        runId: state.runId,
        days: state.days,
        transcriptCount: state.transcriptCount,
        alreadyImportedCount: state.alreadyImportedCount,
        deletedCount: state.deletedCount,
        toImportCount,
        importEstimate: getImportEstimate(state.pageCount),
      };
    case 'importing':
    case 'imported':
      return {
        kind: state.phase,
        importedCount: state.importedCount,
        skippedCount: state.skippedCount,
        unavailableCount: state.unavailableCount,
        toImportCount: toImportCount > 0 ? toImportCount : undefined,
        checkedThrough: state.checkedThrough,
      };
    case 'failed':
      return { kind: 'failed', errorCode: state.errorCode ?? 'unknown' };
  }
};
