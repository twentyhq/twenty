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
  recallRecordingBotPreference: string | null | undefined;
  calendarEventParticipants?:
    | {
        workspaceMemberId?: string | null;
      }[]
    | null;
};
