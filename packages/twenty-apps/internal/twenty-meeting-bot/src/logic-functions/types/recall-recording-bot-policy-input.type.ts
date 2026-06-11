import { type RecallRecordingBotPreference } from 'src/logic-functions/constants/recall-recording-bot-preference';

export type RecallRecordingBotPolicyInput = {
  meetingBotPreference: RecallRecordingBotPreference | null;
  isCanceled: boolean;
  startsAt: string | null;
  endsAt: string | null;
  conferenceLinkUrl: string | null;
  hasAutoRecordParticipant: boolean;
};
