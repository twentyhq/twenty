import { randomBytes } from 'node:crypto';

import { MILLISECONDS_PER_DAY } from 'src/features/transcripts/logic-functions/constants/milliseconds-per-day';
import { type TeamsTranscriptHistoryRunningPhase } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-running-phase.type';
import { type TeamsTranscriptHistoryState } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-state.type';
import { scheduleTeamsTranscriptHistoryRunOrThrow } from 'src/features/transcripts/logic-functions/utils/schedule-teams-transcript-history-run-or-throw';

export const startTeamsTranscriptHistoryRunOrThrow = async ({
  connectedAccountId,
  days,
  phase,
}: {
  connectedAccountId: string;
  days: number;
  phase: TeamsTranscriptHistoryRunningPhase;
}): Promise<TeamsTranscriptHistoryState> => {
  const now = Date.now();
  const state = {
    runId: randomBytes(8).toString('hex'),
    days,
    windowStart: new Date(now - days * MILLISECONDS_PER_DAY).toISOString(),
    windowEnd: new Date(now).toISOString(),
    phase,
    transcriptCount: 0,
    alreadyImportedCount: 0,
    deletedCount: 0,
    pageCount: 0,
    importedCount: 0,
    skippedCount: 0,
    unavailableCount: 0,
    updatedAt: new Date(now).toISOString(),
  };

  await scheduleTeamsTranscriptHistoryRunOrThrow({ connectedAccountId, state });

  return state;
};
