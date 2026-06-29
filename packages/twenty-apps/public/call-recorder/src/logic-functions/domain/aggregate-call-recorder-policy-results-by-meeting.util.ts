import { type CallRecorderPolicyResultForCalendarEvent } from 'src/logic-functions/types/call-recorder-policy-result-for-calendar-event.type';
import { type CallRecorderPolicyResultForMeeting } from 'src/logic-functions/types/call-recorder-policy-result-for-meeting.type';

type CallRecorderPolicyResultForMeetingInput = Pick<
  CallRecorderPolicyResultForCalendarEvent,
  'calendarEventId' | 'realMeetingKey' | 'shouldRequestBot'
>;

export const aggregateCallRecorderPolicyResultsByMeeting = (
  perCalendarEventPolicyResults: CallRecorderPolicyResultForMeetingInput[],
): CallRecorderPolicyResultForMeeting[] => {
  const meetingPolicyResultsByMeetingKey = new Map<
    string,
    CallRecorderPolicyResultForMeeting
  >();

  for (const {
    calendarEventId,
    realMeetingKey,
    shouldRequestBot,
  } of perCalendarEventPolicyResults) {
    const meetingPolicyResult = meetingPolicyResultsByMeetingKey.get(
      realMeetingKey,
    ) ?? {
      realMeetingKey,
      shouldRequestBot: false,
      calendarEventIds: [],
      requestingCalendarEventIds: [],
    };

    meetingPolicyResult.calendarEventIds.push(calendarEventId);

    if (shouldRequestBot) {
      meetingPolicyResult.shouldRequestBot = true;
      meetingPolicyResult.requestingCalendarEventIds.push(calendarEventId);
    }

    meetingPolicyResultsByMeetingKey.set(realMeetingKey, meetingPolicyResult);
  }

  return [...meetingPolicyResultsByMeetingKey.values()];
};
