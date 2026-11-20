import { type GoogleMeetConferenceSyncOutcome } from 'src/logic-functions/types/google-meet-conference-sync-outcome.type';

export type GoogleMeetConferenceSyncResult = {
  outcome: GoogleMeetConferenceSyncOutcome;
  shouldGenerateAiSummary: boolean;
  recordingNameToImport?: string;
};
