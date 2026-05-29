import { UNSUBSCRIBE_MAILBOX_LOCAL_PART } from 'src/engine/core-modules/emailing-domain/constants/unsubscribe-mailbox.constant';
import { type SesInboundMailIntent } from 'src/engine/core-modules/messaging-webhooks/types/ses-inbound-mail-intent.type';
import { type SesInboundNotification } from 'src/engine/core-modules/messaging-webhooks/types/sns-message.type';

export const resolveInboundMailIntent = (
  notification: SesInboundNotification,
): SesInboundMailIntent => {
  const isAddressedToUnsubscribeMailbox = (
    notification.receipt?.recipients ?? []
  ).some(
    (recipient) =>
      recipient.split('@')[0]?.toLowerCase() === UNSUBSCRIBE_MAILBOX_LOCAL_PART,
  );

  return isAddressedToUnsubscribeMailbox ? 'UNSUBSCRIBE' : 'IMPORT';
};
