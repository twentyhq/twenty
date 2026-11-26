import { formatEmailRecipient } from '@/activities/emails/recipients/utils/formatEmailRecipient';
import { type EmailReplyParticipant } from '@/activities/emails/types/EmailReplyParticipant';

export const formatReplyParticipants = (
  participants: EmailReplyParticipant[],
): string =>
  participants
    .map((participant) =>
      formatEmailRecipient({
        address: participant.handle,
        displayName: participant.displayName,
      }),
    )
    .join(', ');
