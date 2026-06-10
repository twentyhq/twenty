import { type RecallRecordingBotPreference } from 'src/logic-functions/constants/recall-recording-bot-preference';

export type RecallRecordingBotPolicyInput = {
  recallRecordingBotPreference: RecallRecordingBotPreference;
  isCanceled: boolean;
  startsAt: string | null;
  endsAt: string | null;
  conferenceLinkUrl: string | null;
  hasExternalParticipant: boolean;
};
