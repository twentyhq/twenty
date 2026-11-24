import { isDefined } from 'twenty-sdk/utils';

import { GOOGLE_CALENDAR_RESOURCE_DOMAIN } from 'src/logic-functions/constants/google-calendar-resource-domain';
import { FREE_EMAIL_PROVIDER_DOMAINS } from 'src/logic-functions/constants/free-email-provider-domains';
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

  const ownerDomain = getEmailDomain(ownerHandle);
  const workspaceDomain =
    isDefined(ownerDomain) && !FREE_EMAIL_PROVIDER_DOMAINS.includes(ownerDomain)
      ? ownerDomain
      : undefined;

  return participants.every(({ handle, isWorkspaceMember }) => {
    const participantDomain = getEmailDomain(handle);

    return (
      isWorkspaceMember ||
      !isDefined(handle) ||
      // A booked room is saved as a participant; Google gives it this domain.
      participantDomain === GOOGLE_CALENDAR_RESOURCE_DOMAIN ||
      handle.trim().toLowerCase() === ownerHandle.trim().toLowerCase() ||
      (isDefined(workspaceDomain) && participantDomain === workspaceDomain)
    );
  });
};
