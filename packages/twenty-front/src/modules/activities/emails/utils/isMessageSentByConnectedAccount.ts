import { isNonEmptyString } from '@sniptt/guards';

import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';

export const isMessageSentByConnectedAccount = ({
  message,
  connectedAccountHandle,
}: {
  message: Pick<EmailThreadMessageWithSender, 'sender'>;
  connectedAccountHandle: string | null | undefined;
}): boolean =>
  isNonEmptyString(connectedAccountHandle) &&
  (message.sender?.handle ?? '').toLowerCase() ===
    connectedAccountHandle.toLowerCase();
