import { type EmailThreadMessage } from '@/activities/emails/types/EmailThreadMessage';
import { MessageDeliveryStatus } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const MESSAGE_DELIVERY_STATUS_RANK: Record<MessageDeliveryStatus, number> = {
  [MessageDeliveryStatus.SENT]: 0,
  [MessageDeliveryStatus.DELIVERED]: 1,
  [MessageDeliveryStatus.READ]: 2,
};

// Providers only report a receipt on the latest message, so a later outgoing message carries its status back
export const resolveChatMessageDeliveryStatuses = <
  TMessage extends Pick<EmailThreadMessage, 'id' | 'deliveryStatus'>,
>({
  messages,
  outgoingMessageIds,
}: {
  messages: TMessage[];
  outgoingMessageIds: ReadonlySet<string>;
}): TMessage[] => {
  let laterOutgoingStatus: MessageDeliveryStatus | null = null;

  return messages
    .toReversed()
    .map((message) => {
      if (!outgoingMessageIds.has(message.id)) {
        return message;
      }

      const ownStatus = message.deliveryStatus ?? null;

      if (
        isDefined(ownStatus) &&
        (!isDefined(laterOutgoingStatus) ||
          MESSAGE_DELIVERY_STATUS_RANK[ownStatus] >
            MESSAGE_DELIVERY_STATUS_RANK[laterOutgoingStatus])
      ) {
        laterOutgoingStatus = ownStatus;

        return message;
      }

      return isDefined(ownStatus)
        ? { ...message, deliveryStatus: laterOutgoingStatus }
        : message;
    })
    .toReversed();
};
