export type RecallRecordingBotPolicyResultForMeeting = {
  realMeetingKey: string;
  shouldRequestBot: boolean;
  calendarEventIds: string[];
  requestingCalendarEventIds: string[];
};
