import { isDefined } from 'twenty-shared/utils';

import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { getReplyToRecipients } from '@/activities/emails/utils/getReplyToRecipients';

export type EmailReplyDefaults = {
  to: string;
  subject: string;
  inReplyTo: string;
};

// What the thread says a reply should look like, whoever ends up sending it.
// Null when there is nothing to reply to yet.
export const getReplyDefaultsFromMessages = ({
  messages,
  connectedAccountHandle,
}: {
  messages: EmailThreadMessageWithSender[];
  connectedAccountHandle: string | null | undefined;
}): EmailReplyDefaults | null => {
  const sentMessages = messages.filter((message) => !message.isDraft);
  const lastSentMessage = sentMessages[sentMessages.length - 1];

  if (!isDefined(lastSentMessage)) {
    return messages.length === 0
      ? null
      : { to: '', subject: '', inReplyTo: '' };
  }

  const rawSubject = lastSentMessage.subject ?? '';

  return {
    to: getReplyToRecipients({
      message: lastSentMessage,
      connectedAccountHandle,
    }),
    subject: rawSubject.startsWith('Re: ') ? rawSubject : `Re: ${rawSubject}`,
    inReplyTo: lastSentMessage.headerMessageId ?? '',
  };
};
