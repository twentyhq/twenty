import { isNonEmptyString } from '@sniptt/guards';

import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';

export const getUniqueReplyParticipants = ({
  participants,
  connectedAccountHandle,
  excludedParticipants = [],
}: {
  participants: EmailThreadMessageParticipant[];
  connectedAccountHandle: string | null | undefined;
  excludedParticipants?: EmailThreadMessageParticipant[];
}): EmailThreadMessageParticipant[] => {
  const seenHandles = new Set<string>(
    excludedParticipants.map((participant) => participant.handle.toLowerCase()),
  );

  if (isNonEmptyString(connectedAccountHandle)) {
    seenHandles.add(connectedAccountHandle.toLowerCase());
  }

  return participants.filter((participant) => {
    if (!isNonEmptyString(participant.handle)) {
      return false;
    }

    const normalizedHandle = participant.handle.toLowerCase();

    if (seenHandles.has(normalizedHandle)) {
      return false;
    }

    seenHandles.add(normalizedHandle);

    return true;
  });
};
