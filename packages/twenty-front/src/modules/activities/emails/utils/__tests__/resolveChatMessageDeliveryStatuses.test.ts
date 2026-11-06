import { MessageDeliveryStatus } from 'twenty-shared/types';

import { resolveChatMessageDeliveryStatuses } from '@/activities/emails/utils/resolveChatMessageDeliveryStatuses';

const OUTGOING_MESSAGE_IDS = new Set(['first', 'second', 'third']);

describe('resolveChatMessageDeliveryStatuses', () => {
  it('marks earlier outgoing messages read once a later one is read', () => {
    expect(
      resolveChatMessageDeliveryStatuses({
        messages: [
          { id: 'first', deliveryStatus: MessageDeliveryStatus.SENT },
          { id: 'incoming', deliveryStatus: null },
          { id: 'second', deliveryStatus: MessageDeliveryStatus.DELIVERED },
          { id: 'third', deliveryStatus: MessageDeliveryStatus.READ },
        ],
        outgoingMessageIds: OUTGOING_MESSAGE_IDS,
      }),
    ).toEqual([
      { id: 'first', deliveryStatus: MessageDeliveryStatus.READ },
      { id: 'incoming', deliveryStatus: null },
      { id: 'second', deliveryStatus: MessageDeliveryStatus.READ },
      { id: 'third', deliveryStatus: MessageDeliveryStatus.READ },
    ]);
  });

  it('keeps a later message behind an earlier one that was read', () => {
    expect(
      resolveChatMessageDeliveryStatuses({
        messages: [
          { id: 'first', deliveryStatus: MessageDeliveryStatus.READ },
          { id: 'second', deliveryStatus: MessageDeliveryStatus.SENT },
        ],
        outgoingMessageIds: OUTGOING_MESSAGE_IDS,
      }),
    ).toEqual([
      { id: 'first', deliveryStatus: MessageDeliveryStatus.READ },
      { id: 'second', deliveryStatus: MessageDeliveryStatus.SENT },
    ]);
  });

  it('gives no status to a message whose provider reports none', () => {
    expect(
      resolveChatMessageDeliveryStatuses({
        messages: [
          { id: 'first', deliveryStatus: null },
          { id: 'second', deliveryStatus: MessageDeliveryStatus.READ },
        ],
        outgoingMessageIds: OUTGOING_MESSAGE_IDS,
      }),
    ).toEqual([
      { id: 'first', deliveryStatus: null },
      { id: 'second', deliveryStatus: MessageDeliveryStatus.READ },
    ]);
  });
});
