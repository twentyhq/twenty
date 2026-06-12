// Domain read shape: wire composites are flattened and absence is undefined.
export type MeetingBotPolicyCalendarEventInput = {
  id: string;
  isCanceled: boolean;
  startsAt: string | undefined;
  endsAt: string | undefined;
  iCalUid: string | undefined;
  conferenceLinkUrl: string | undefined;
  meetingBotPreference: string | undefined;
  calendarEventParticipants: {
    workspaceMemberId: string | undefined;
    workspaceMemberMeetingBotAutoRecordEnabled: boolean;
  }[];
};
