import { isNonEmptyString } from '@sniptt/guards';

import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';

export const getParticipantFirstName = (
  participant:
    | Pick<EmailThreadMessageParticipant, 'displayName' | 'person'>
    | undefined,
) => {
  const firstName = participant?.person?.name?.firstName;

  if (isNonEmptyString(firstName)) {
    return firstName;
  }

  return isNonEmptyString(participant?.displayName)
    ? participant.displayName
    : null;
};
