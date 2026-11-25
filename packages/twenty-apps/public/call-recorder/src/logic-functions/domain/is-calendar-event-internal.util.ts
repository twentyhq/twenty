import { isWorkEmail } from 'twenty-sdk/email';
import { isDefined } from 'twenty-sdk/utils';

import { GOOGLE_CALENDAR_RESOURCE_DOMAIN } from 'src/logic-functions/constants/google-calendar-resource-domain';
import { type CalendarEventParticipant } from 'src/logic-functions/types/calendar-event-participant.type';
import { getEmailDomain } from 'src/logic-functions/utils/get-email-domain.util';

export const isCalendarEventInternal = ({
  participants,
  hasUnlistedParticipants,
  ownerHandle,
}: {
  participants: CalendarEventParticipant[];
  hasUnlistedParticipants: boolean;
  ownerHandle: string;
}): boolean => {
  if (hasUnlistedParticipants) {
    return false;
  }

  const normalizedOwnerHandle = ownerHandle.trim().toLowerCase();
  const workspaceDomain = isWorkEmail(normalizedOwnerHandle)
    ? getEmailDomain(normalizedOwnerHandle)
    : undefined;

  return participants.every(({ handle, isWorkspaceMember }) => {
    const participantDomain = getEmailDomain(handle);

    return (
      isWorkspaceMember ||
      !isDefined(handle) ||
      // A booked room is saved as a participant; Google gives it this domain.
      participantDomain === GOOGLE_CALENDAR_RESOURCE_DOMAIN ||
      handle.trim().toLowerCase() === normalizedOwnerHandle ||
      (isDefined(workspaceDomain) && participantDomain === workspaceDomain)
    );
  });
};
