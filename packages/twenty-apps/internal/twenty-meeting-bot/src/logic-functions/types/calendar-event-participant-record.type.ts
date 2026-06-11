export type CalendarEventParticipantRecord = {
  id: string;
  calendarEventId: string | undefined;
  workspaceMemberId: string | undefined;
  workspaceMemberMeetingBotAutoRecordEnabled: boolean;
};
