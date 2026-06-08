import { type RecallRecordingBotPreference } from 'src/logic-functions/types/recall-recording-bot-preference.type';
import { type RecallRecordingBotPolicyResult } from 'src/logic-functions/types/recall-recording-bot-policy-result.type';

export type RecallRecordingBotPolicyResultForCalendarEvent =
  RecallRecordingBotPolicyResult & {
    calendarEventId: string;
    recallRecordingBotPreference: RecallRecordingBotPreference;
    realMeetingKey: string;
  };
