export type RecallRecordingBotPolicyCalendarEventInput = {
  id: string;
  isCanceled: boolean;
  startsAt: string | null;
  endsAt: string | null;
  iCalUid: string | null;
  conferenceLink:
    | {
        primaryLinkUrl?: string | null;
      }
    | null
    | undefined;
  meetingBotPreference: string | null | undefined;
  calendarEventParticipants?:
    | {
        workspaceMemberId?: string | null;
        workspaceMemberMeetingBotAutoRecordEnabled?: boolean;
      }[]
    | null;
};
