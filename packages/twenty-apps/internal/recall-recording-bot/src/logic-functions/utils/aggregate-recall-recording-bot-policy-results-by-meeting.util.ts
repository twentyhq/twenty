import { type RecallRecordingBotPolicyResultForCalendarEvent } from 'src/logic-functions/types/recall-recording-bot-policy-result-for-calendar-event.type';
import { type RecallRecordingBotPolicyResultForMeeting } from 'src/logic-functions/types/recall-recording-bot-policy-result-for-meeting.type';

type RecallRecordingBotPolicyResultForMeetingInput = Pick<
  RecallRecordingBotPolicyResultForCalendarEvent,
  'calendarEventId' | 'realMeetingKey' | 'shouldRequestBot'
>;

export const aggregateRecallRecordingBotPolicyResultsByMeeting = (
  perCalendarEventPolicyResults: RecallRecordingBotPolicyResultForMeetingInput[],
): RecallRecordingBotPolicyResultForMeeting[] => {
  const meetingPolicyResultsByMeetingKey = new Map<
    string,
    RecallRecordingBotPolicyResultForMeeting
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
