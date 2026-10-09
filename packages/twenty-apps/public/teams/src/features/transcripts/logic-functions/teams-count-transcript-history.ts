import { defineLogicFunction } from 'twenty-sdk/define';

import { TEAMS_COUNT_TRANSCRIPT_HISTORY_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';
import { type TeamsTranscriptHistoryJobPayload } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-job-payload.type';
import { processTeamsTranscriptHistoryPageOrThrow } from 'src/features/transcripts/logic-functions/utils/process-teams-transcript-history-page-or-throw';

export const teamsCountTranscriptHistoryHandler = (
  payload: Partial<Record<keyof TeamsTranscriptHistoryJobPayload, unknown>>,
) => processTeamsTranscriptHistoryPageOrThrow({ phase: 'counting', payload });

export default defineLogicFunction({
  universalIdentifier: TEAMS_COUNT_TRANSCRIPT_HISTORY_UNIVERSAL_IDENTIFIER,
  name: 'teams-count-transcript-history',
  description:
    'Counts the Teams transcripts on one calendar page of a history import window, and how many are already in Twenty, then queues the next page.',
  timeoutSeconds: 300,
  handler: teamsCountTranscriptHistoryHandler,
});
