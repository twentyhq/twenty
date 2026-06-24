import { type MeetingBotPolicyResultForCalendarEvent } from 'src/logic-functions/types/meeting-bot-policy-result-for-calendar-event.type';
import { type MeetingBotPolicyResultForMeeting } from 'src/logic-functions/types/meeting-bot-policy-result-for-meeting.type';

type MeetingBotPolicyResultForMeetingInput = Pick<
  MeetingBotPolicyResultForCalendarEvent,
  'calendarEventId' | 'realMeetingKey' | 'shouldRequestBot'
>;

export const aggregateMeetingBotPolicyResultsByMeeting = (
  perCalendarEventPolicyResults: MeetingBotPolicyResultForMeetingInput[],
): MeetingBotPolicyResultForMeeting[] => {
  const meetingPolicyResultsByMeetingKey = new Map<
    string,
    MeetingBotPolicyResultForMeeting
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
