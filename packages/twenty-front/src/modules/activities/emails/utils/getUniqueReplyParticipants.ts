import { isNonEmptyString } from '@sniptt/guards';

import { type EmailReplyParticipant } from '@/activities/emails/types/EmailReplyParticipant';

export const getUniqueReplyParticipants = ({
  participants,
  connectedAccountHandle,
  excludedParticipants = [],
}: {
  participants: EmailReplyParticipant[];
  connectedAccountHandle: string | null | undefined;
  excludedParticipants?: EmailReplyParticipant[];
}): EmailReplyParticipant[] => {
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
