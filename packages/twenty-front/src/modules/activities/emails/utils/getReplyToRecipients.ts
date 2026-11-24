import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { formatReplyParticipants } from '@/activities/emails/utils/formatReplyParticipants';
import { getReplyParticipants } from '@/activities/emails/utils/getReplyParticipants';

export const getReplyToRecipients = ({
  message,
  connectedAccountHandle,
}: {
  message: Pick<EmailThreadMessageWithSender, 'sender' | 'messageParticipants'>;
  connectedAccountHandle: string | null | undefined;
}): string =>
  formatReplyParticipants(
    getReplyParticipants({ message, connectedAccountHandle }),
  );
