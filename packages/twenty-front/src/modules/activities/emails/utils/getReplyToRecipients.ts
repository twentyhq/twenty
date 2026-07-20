import { isNonEmptyString } from '@sniptt/guards';

import { formatEmailRecipient } from '@/activities/emails/recipients/utils/formatEmailRecipient';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { MessageParticipantRole } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getReplyToRecipients = ({
  message,
  connectedAccountHandle,
}: {
  message: EmailThreadMessageWithSender;
  connectedAccountHandle: string | null | undefined;
}): string => {
  const senderHandle = message.sender?.handle ?? '';
  const wasSentByConnectedAccount =
    isNonEmptyString(connectedAccountHandle) &&
    senderHandle.toLowerCase() === connectedAccountHandle.toLowerCase();

  const replyToParticipants = message.messageParticipants.filter(
    (participant) => participant.role === MessageParticipantRole.REPLY_TO,
  );

  const replyParticipants = wasSentByConnectedAccount
    ? message.messageParticipants.filter(
        (participant) =>
          participant.role === MessageParticipantRole.TO ||
          participant.role === MessageParticipantRole.CC,
      )
    : replyToParticipants.length > 0
      ? replyToParticipants
      : isDefined(message.sender)
        ? [message.sender]
        : [];

  const seenHandles = new Set<string>();

  return replyParticipants
    .filter((participant) => isNonEmptyString(participant.handle))
    .filter(
      (participant) =>
        !isNonEmptyString(connectedAccountHandle) ||
        participant.handle.toLowerCase() !==
          connectedAccountHandle.toLowerCase(),
    )
    .filter((participant) => {
      const normalizedHandle = participant.handle.toLowerCase();

      if (seenHandles.has(normalizedHandle)) {
        return false;
      }

      seenHandles.add(normalizedHandle);

      return true;
    })
    .map((participant) =>
      formatEmailRecipient({
        address: participant.handle,
        displayName: participant.displayName,
      }),
    )
    .join(', ');
};
