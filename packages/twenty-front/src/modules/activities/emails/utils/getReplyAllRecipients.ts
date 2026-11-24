import { type EmailReplyMessage } from '@/activities/emails/types/EmailReplyMessage';
import { formatReplyParticipants } from '@/activities/emails/utils/formatReplyParticipants';
import { getReplyParticipants } from '@/activities/emails/utils/getReplyParticipants';
import { getUniqueReplyParticipants } from '@/activities/emails/utils/getUniqueReplyParticipants';
import { isMessageSentByConnectedAccount } from '@/activities/emails/utils/isMessageSentByConnectedAccount';
import { MessageParticipantRole } from 'twenty-shared/types';

// Null when Reply all would reach nobody beyond what Reply already reaches.
export const getReplyAllRecipients = ({
  message,
  connectedAccountHandle,
}: {
  message: EmailReplyMessage;
  connectedAccountHandle: string | null | undefined;
}): { to: string; cc: string } | null => {
  const getParticipantsWithRole = (role: MessageParticipantRole) =>
    message.messageParticipants.filter(
      (participant) => participant.role === role,
    );

  const toParticipants = isMessageSentByConnectedAccount({
    message,
    connectedAccountHandle,
  })
    ? getParticipantsWithRole(MessageParticipantRole.TO)
    : [
        ...getReplyParticipants({ message, connectedAccountHandle }),
        ...getParticipantsWithRole(MessageParticipantRole.TO),
      ];

  const uniqueToParticipants = getUniqueReplyParticipants({
    participants: toParticipants,
    connectedAccountHandle,
  });

  const uniqueCcParticipants = getUniqueReplyParticipants({
    participants: getParticipantsWithRole(MessageParticipantRole.CC),
    connectedAccountHandle,
    excludedParticipants: uniqueToParticipants,
  });

  const replyParticipantCount = getReplyParticipants({
    message,
    connectedAccountHandle,
  }).length;

  if (
    uniqueToParticipants.length + uniqueCcParticipants.length <=
    replyParticipantCount
  ) {
    return null;
  }

  return {
    to: formatReplyParticipants(uniqueToParticipants),
    cc: formatReplyParticipants(uniqueCcParticipants),
  };
};
