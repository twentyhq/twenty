import { type EmailReplyMessage } from '@/activities/emails/types/EmailReplyMessage';
import { formatReplyParticipants } from '@/activities/emails/utils/formatReplyParticipants';
import { getReplyParticipants } from '@/activities/emails/utils/getReplyParticipants';

export const getReplyToRecipients = ({
  message,
  connectedAccountHandle,
}: {
  message: EmailReplyMessage;
  connectedAccountHandle: string | null | undefined;
}): string =>
  formatReplyParticipants(
    getReplyParticipants({ message, connectedAccountHandle }),
  );
