import {
  mockStripeSubscriptionUpdatedEventWithDeletedItem,
  mockStripeSubscriptionUpdatedEventWithoutUpdatedItem,
  mockStripeSubscriptionUpdatedEventWithUpdatedItemOnly,
} from 'src/engine/core-modules/billing-webhook/__mocks__/stripe-subscription-updated-events';
import { getDeletedStripeSubscriptionItemIdsFromStripeSubscriptionEvent } from 'src/engine/core-modules/billing-webhook/utils/get-deleted-stripe-subscription-item-ids-from-stripe-subscription-event.util';

describe('getDeletedStripeSubscriptionItemIdsFromStripeSubscriptionEvent', () => {
  it('should return an empty array if subscription items are not updated', () => {
    const result =
      getDeletedStripeSubscriptionItemIdsFromStripeSubscriptionEvent(
        mockStripeSubscriptionUpdatedEventWithoutUpdatedItem,
      );

    expect(result).toEqual([]);
  });
  it('should return an empty array if subscription items are updated but not deleted', () => {
    const result =
      getDeletedStripeSubscriptionItemIdsFromStripeSubscriptionEvent(
        mockStripeSubscriptionUpdatedEventWithUpdatedItemOnly,
      );

    expect(result).toEqual([]);
  });
  it('should return subscription item ids if subscription items are deleted', () => {
    const result =
      getDeletedStripeSubscriptionItemIdsFromStripeSubscriptionEvent(
        mockStripeSubscriptionUpdatedEventWithDeletedItem,
      );

    expect(result).toEqual(['deleted_item_id']);
  });
});
