import { type MeetConferenceSyncOutcome } from 'src/logic-functions/types/meet-conference-sync-outcome.type';

export type MeetConferenceSyncResult = {
  outcome: MeetConferenceSyncOutcome;
  shouldGenerateAiSummary: boolean;
  recordingNameToImport?: string;
};
