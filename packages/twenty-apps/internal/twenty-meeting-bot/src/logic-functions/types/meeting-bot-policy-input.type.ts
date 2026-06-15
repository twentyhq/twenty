import { type MeetingBotPreference } from 'src/logic-functions/constants/meeting-bot-preference';

export type MeetingBotPolicyInput = {
  meetingBotPreference: MeetingBotPreference | undefined;
  isCanceled: boolean;
  startsAt: string | undefined;
  endsAt: string | undefined;
  conferenceLinkUrl: string | undefined;
  hasAutoRecordChannelOwner: boolean;
};
