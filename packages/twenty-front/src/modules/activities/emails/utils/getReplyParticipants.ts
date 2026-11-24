import { type EmailReplyMessage } from '@/activities/emails/types/EmailReplyMessage';
import { type EmailReplyParticipant } from '@/activities/emails/types/EmailReplyParticipant';
import { getUniqueReplyParticipants } from '@/activities/emails/utils/getUniqueReplyParticipants';
import { isMessageSentByConnectedAccount } from '@/activities/emails/utils/isMessageSentByConnectedAccount';
import { MessageParticipantRole } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const getCandidateReplyParticipants = ({
  message,
  connectedAccountHandle,
}: {
  message: EmailReplyMessage;
  connectedAccountHandle: string | null | undefined;
}): EmailReplyParticipant[] => {
  if (isMessageSentByConnectedAccount({ message, connectedAccountHandle })) {
    return message.messageParticipants.filter(
      (participant) =>
        participant.role === MessageParticipantRole.TO ||
        participant.role === MessageParticipantRole.CC,
    );
  }

  const replyToParticipants = message.messageParticipants.filter(
    (participant) => participant.role === MessageParticipantRole.REPLY_TO,
  );

  if (replyToParticipants.length > 0) {
    return replyToParticipants;
  }

  if (isDefined(message.sender)) {
    return [message.sender];
  }

  return [];
};

export const getReplyParticipants = ({
  message,
  connectedAccountHandle,
}: {
  message: EmailReplyMessage;
  connectedAccountHandle: string | null | undefined;
}): EmailReplyParticipant[] =>
  getUniqueReplyParticipants({
    participants: getCandidateReplyParticipants({
      message,
      connectedAccountHandle,
    }),
    connectedAccountHandle,
  });
