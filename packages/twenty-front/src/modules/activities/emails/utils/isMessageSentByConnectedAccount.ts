import { isNonEmptyString } from '@sniptt/guards';

import { type EmailReplyMessage } from '@/activities/emails/types/EmailReplyMessage';

export const isMessageSentByConnectedAccount = ({
  message,
  connectedAccountHandle,
}: {
  message: Pick<EmailReplyMessage, 'sender'>;
  connectedAccountHandle: string | null | undefined;
}): boolean =>
  isNonEmptyString(connectedAccountHandle) &&
  (message.sender?.handle ?? '').toLowerCase() ===
    connectedAccountHandle.toLowerCase();
