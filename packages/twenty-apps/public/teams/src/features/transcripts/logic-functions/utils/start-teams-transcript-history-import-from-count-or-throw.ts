import { kv } from 'twenty-sdk/logic-function';

import { type TeamsTranscriptHistoryRouteResult } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-route-result.type';
import { type TeamsTranscriptHistoryState } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-state.type';
import { buildTeamsTranscriptHistoryKvKey } from 'src/features/transcripts/logic-functions/utils/build-teams-transcript-history-kv-key';
import { scheduleTeamsTranscriptHistoryRunOrThrow } from 'src/features/transcripts/logic-functions/utils/schedule-teams-transcript-history-run-or-throw';

export const startTeamsTranscriptHistoryImportFromCountOrThrow = async ({
  connectedAccountId,
  runId,
}: {
  connectedAccountId: string;
  runId: string;
}): Promise<TeamsTranscriptHistoryRouteResult> => {
  const countedState = await kv.get<TeamsTranscriptHistoryState>(
    buildTeamsTranscriptHistoryKvKey(connectedAccountId),
  );

  if (countedState?.runId !== runId || countedState.phase !== 'counted') {
    return { success: false, errorCode: 'count-required' };
  }

  const state: TeamsTranscriptHistoryState & { phase: 'importing' } = {
    ...countedState,
    phase: 'importing',
    pageCount: 0,
    importedCount: 0,
    skippedCount: 0,
    unavailableCount: 0,
    checkedThrough: undefined,
    updatedAt: new Date().toISOString(),
  };

  await scheduleTeamsTranscriptHistoryRunOrThrow({ connectedAccountId, state });

  return { success: true, state, isStalled: false };
};
