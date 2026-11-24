import { formatEmailRecipient } from '@/activities/emails/recipients/utils/formatEmailRecipient';
import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';

export const formatReplyParticipants = (
  participants: EmailThreadMessageParticipant[],
): string =>
  participants
    .map((participant) =>
      formatEmailRecipient({
        address: participant.handle,
        displayName: participant.displayName,
      }),
    )
    .join(', ');
