import { type EmailDraftPrefill } from '@/activities/emails/types/EmailDraftPrefill';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { MessageParticipantRole } from 'twenty-shared/types';

export const getEmailDraftPrefillFromMessage = (
  message: EmailThreadMessageWithSender,
): EmailDraftPrefill => {
  const joinHandlesByRole = (role: MessageParticipantRole) =>
    message.messageParticipants
      .filter((participant) => participant.role === role)
      .map((participant) => participant.handle)
      .join(', ');

  return {
    messageId: message.id,
    to: joinHandlesByRole(MessageParticipantRole.TO),
    cc: joinHandlesByRole(MessageParticipantRole.CC),
    bcc: joinHandlesByRole(MessageParticipantRole.BCC),
    subject: message.subject,
    body: message.text,
  };
};
