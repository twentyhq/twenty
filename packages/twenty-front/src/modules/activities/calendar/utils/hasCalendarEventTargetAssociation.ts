import { isNonEmptyString } from '@sniptt/guards';

export const hasCalendarEventTargetAssociation = ({
  attendeeEmails,
  requiredAttendee,
  sendInvitations,
}: {
  attendeeEmails: string[];
  requiredAttendee: string | undefined;
  sendInvitations: boolean;
}) =>
  sendInvitations &&
  isNonEmptyString(requiredAttendee) &&
  attendeeEmails.some(
    (email) => email.toLowerCase() === requiredAttendee.toLowerCase(),
  );
