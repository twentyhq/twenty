export type CallRecorderPolicyResultForMeeting = {
  realMeetingKey: string;
  shouldRequestBot: boolean;
  calendarEventIds: string[];
  requestingCalendarEventIds: string[];
};
