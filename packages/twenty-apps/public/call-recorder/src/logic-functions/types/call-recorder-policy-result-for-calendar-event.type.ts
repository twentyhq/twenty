import { type CallRecorderPreference } from 'src/constants/call-recorder-preference';
import { type CallRecorderPolicyResult } from 'src/logic-functions/types/call-recorder-policy-result.type';

export type CallRecorderPolicyResultForCalendarEvent =
  CallRecorderPolicyResult & {
    calendarEventId: string;
    callRecorderPreference: CallRecorderPreference | undefined;
    realMeetingKey: string;
  };
