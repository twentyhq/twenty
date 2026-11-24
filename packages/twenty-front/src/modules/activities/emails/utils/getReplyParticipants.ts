import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { getUniqueReplyParticipants } from '@/activities/emails/utils/getUniqueReplyParticipants';
import { isMessageSentByConnectedAccount } from '@/activities/emails/utils/isMessageSentByConnectedAccount';
import { MessageParticipantRole } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getReplyParticipants = ({
  message,
  connectedAccountHandle,
}: {
  message: Pick<EmailThreadMessageWithSender, 'sender' | 'messageParticipants'>;
  connectedAccountHandle: string | null | undefined;
}): EmailThreadMessageParticipant[] => {
  if (isMessageSentByConnectedAccount({ message, connectedAccountHandle })) {
    return getUniqueReplyParticipants({
      participants: message.messageParticipants.filter(
        (participant) =>
          participant.role === MessageParticipantRole.TO ||
          participant.role === MessageParticipantRole.CC,
      ),
      connectedAccountHandle,
    });
  }

  const replyToParticipants = message.messageParticipants.filter(
    (participant) => participant.role === MessageParticipantRole.REPLY_TO,
  );

  return getUniqueReplyParticipants({
    participants:
      replyToParticipants.length > 0
        ? replyToParticipants
        : isDefined(message.sender)
          ? [message.sender]
          : [],
    connectedAccountHandle,
  });
};
