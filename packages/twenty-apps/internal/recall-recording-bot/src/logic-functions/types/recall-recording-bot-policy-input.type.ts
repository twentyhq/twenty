import { type RecallRecordingBotPreference } from 'src/logic-functions/types/recall-recording-bot-preference.type';

export type RecallRecordingBotPolicyInput = {
  recallRecordingBotPreference: RecallRecordingBotPreference;
  isCanceled: boolean;
  startsAt: string | null;
  endsAt: string | null;
  conferenceLinkUrl: string | null;
  hasExternalParticipant: boolean;
};
