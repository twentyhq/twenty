import { isNonEmptyString } from '@sniptt/guards';

import { formatEmailRecipient } from '@/activities/emails/recipients/utils/formatEmailRecipient';
import { type EmailDraftPrefill } from '@/activities/emails/types/EmailDraftPrefill';
import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { MessageParticipantRole } from 'twenty-shared/types';

export const getEmailDraftPrefillFromMessage = (
  message: Pick<EmailThreadMessageWithSender, 'id' | 'subject' | 'text'> & {
    messageParticipants: Pick<
      EmailThreadMessageParticipant,
      'role' | 'handle' | 'displayName'
    >[];
  },
): EmailDraftPrefill => {
  const joinRecipientsByRole = (role: MessageParticipantRole) =>
    message.messageParticipants
      .filter((participant) => participant.role === role)
      .filter((participant) => isNonEmptyString(participant.handle))
      .map((participant) =>
        formatEmailRecipient({
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
    body: serializePlainTextAsAdvancedTextEditorDocument(message.text),
  };
};
