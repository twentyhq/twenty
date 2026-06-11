import { type RecallRecordingBotPreference } from 'src/logic-functions/constants/recall-recording-bot-preference';

export type RecallRecordingBotPolicyInput = {
  meetingBotPreference: RecallRecordingBotPreference | undefined;
  isCanceled: boolean;
  startsAt: string | undefined;
  endsAt: string | undefined;
  conferenceLinkUrl: string | undefined;
  hasAutoRecordParticipant: boolean;
};
