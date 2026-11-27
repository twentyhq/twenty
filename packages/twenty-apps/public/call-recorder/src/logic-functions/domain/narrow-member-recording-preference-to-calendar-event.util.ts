import { type CalendarEventRecordingPreference } from 'src/logic-functions/types/calendar-event-recording-preference.type';
import { type MemberRecordingPreference } from 'src/logic-functions/types/member-recording-preference.type';

export const narrowMemberRecordingPreferenceToCalendarEvent = ({
  memberRecordingPreference,
  isCalendarEventInternal,
}: {
  memberRecordingPreference: MemberRecordingPreference;
  isCalendarEventInternal: boolean;
}): CalendarEventRecordingPreference => {
  if (memberRecordingPreference === 'INTERNAL') {
    return isCalendarEventInternal ? 'ALL' : 'NONE';
  }

  if (memberRecordingPreference === 'EXTERNAL') {
    return isCalendarEventInternal ? 'NONE' : 'ALL';
  }

  return memberRecordingPreference;
};
