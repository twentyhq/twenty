export type MeetingBotPolicyResultForMeeting = {
  realMeetingKey: string;
  shouldRequestBot: boolean;
  calendarEventIds: string[];
  requestingCalendarEventIds: string[];
};
