import { type CallRecorderPreference } from 'src/constants/call-recorder-preference';
import { type CalendarEventRecordingPreference } from 'src/logic-functions/types/calendar-event-recording-preference.type';

export type CallRecorderPolicyInput = {
  isCalendarBotSchedulingEnabled: boolean;
  callRecorderPreference: CallRecorderPreference | undefined;
  ownerRecordingPreferences: CalendarEventRecordingPreference[];
  isCanceled: boolean;
  startsAt: string | undefined;
  endsAt: string | undefined;
  conferenceLinkUrl: string | undefined;
};
