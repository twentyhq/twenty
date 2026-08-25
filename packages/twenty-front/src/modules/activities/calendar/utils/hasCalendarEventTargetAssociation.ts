import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type EmailRecipient } from '@/activities/emails/recipients/types/EmailRecipient';

export const hasCalendarEventTargetAssociation = ({
  attendees,
  relatedPersonIds,
  requiredAttendee,
  sendInvitations,
}: {
  attendees: EmailRecipient[];
  relatedPersonIds: string[];
  requiredAttendee: string | undefined;
  sendInvitations: boolean;
}) => {
  if (!sendInvitations) {
    return false;
  }

  const relatedPersonIdSet = new Set(relatedPersonIds);

  return attendees.some(
    (attendee) =>
      (isDefined(attendee.personId) &&
        relatedPersonIdSet.has(attendee.personId)) ||
      (isNonEmptyString(requiredAttendee) &&
        attendee.address.toLowerCase() === requiredAttendee.toLowerCase()),
  );
};
