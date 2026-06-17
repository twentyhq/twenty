import { type MeetingBotPreference } from 'src/constants/meeting-bot-preference';
import { type MeetingBotPolicyResult } from 'src/logic-functions/types/meeting-bot-policy-result.type';

export type MeetingBotPolicyResultForCalendarEvent = MeetingBotPolicyResult & {
  calendarEventId: string;
  meetingBotPreference: MeetingBotPreference | undefined;
  realMeetingKey: string;
};
