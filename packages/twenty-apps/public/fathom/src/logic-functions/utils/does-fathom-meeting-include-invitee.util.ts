import { type Meeting } from 'fathom-typescript/sdk/models/shared';

export const doesFathomMeetingIncludeInvitee = ({
  meeting,
  normalizedInviteeEmail,
}: {
  meeting: Pick<Meeting, 'calendarInvitees'>;
  normalizedInviteeEmail: string;
}): boolean =>
  meeting.calendarInvitees.some(
    (invitee) => invitee.email?.trim().toLowerCase() === normalizedInviteeEmail,
  );
