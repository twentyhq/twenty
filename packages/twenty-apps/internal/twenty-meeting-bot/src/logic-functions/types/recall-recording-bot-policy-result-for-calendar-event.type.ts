import { type RecallRecordingBotPreference } from 'src/logic-functions/constants/recall-recording-bot-preference';
import { type RecallRecordingBotPolicyResult } from 'src/logic-functions/types/recall-recording-bot-policy-result.type';

export type RecallRecordingBotPolicyResultForCalendarEvent =
  RecallRecordingBotPolicyResult & {
    calendarEventId: string;
    meetingBotPreference: RecallRecordingBotPreference | null;
    realMeetingKey: string;
  };
