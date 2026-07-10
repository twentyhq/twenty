import { isNonEmptyString } from '@sniptt/guards';
import { MessageParticipantRole } from 'twenty-shared/types';
import { formatEmailAddressWithDisplayName } from 'twenty-shared/utils';

import { type EmailDraftPrefill } from '@/activities/emails/types/EmailDraftPrefill';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';

export const getEmailDraftPrefillFromMessage = (
  message: EmailThreadMessageWithSender,
): EmailDraftPrefill => {
  const joinRecipientsByRole = (role: MessageParticipantRole) =>
    message.messageParticipants
      .filter((participant) => participant.role === role)
      .filter((participant) => isNonEmptyString(participant.handle))
      .map((participant) =>
        formatEmailAddressWithDisplayName({
          address: participant.handle,
          displayName: participant.displayName,
        }),
      )
      .join(', ');

  return {
    messageId: message.id,
    to: joinRecipientsByRole(MessageParticipantRole.TO),
    cc: joinRecipientsByRole(MessageParticipantRole.CC),
    bcc: joinRecipientsByRole(MessageParticipantRole.BCC),
    subject: message.subject,
    body: message.text,
  };
};
