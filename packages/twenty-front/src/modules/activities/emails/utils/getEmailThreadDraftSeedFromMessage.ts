import { type EmailThreadDraftSeed } from '@/activities/emails/types/EmailThreadDraftSeed';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { MessageParticipantRole } from 'twenty-shared/types';

export const getEmailThreadDraftSeedFromMessage = (
  message: EmailThreadMessageWithSender,
): EmailThreadDraftSeed => {
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
