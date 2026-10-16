import { mockStripeSubscriptionUpdatedEventWithUpdatedItemOnly } from 'src/engine/core-modules/billing-webhook/__mocks__/stripe-subscription-updated-events';
import { getBaseSeatChangeFromStripeSubscriptionEvent } from 'src/engine/core-modules/billing-webhook/utils/get-base-seat-change-from-stripe-subscription-event.util';

const createEvent = () => {
  const event = structuredClone(
    mockStripeSubscriptionUpdatedEventWithUpdatedItemOnly,
  );
  const item = event.data.object.items.data[0];

  item.price.product = 'prod_base';
  item.quantity = 8;
  event.data.previous_attributes = {
    items: { ...event.data.object.items, data: [{ ...item, quantity: 5 }] },
  };

  return event;
};

describe('getBaseSeatChangeFromStripeSubscriptionEvent', () => {
  it('reads the base quantity delta from Stripe', () => {
    expect(
      getBaseSeatChangeFromStripeSubscriptionEvent(createEvent(), [
        'prod_base',
      ]),
    ).toEqual({ previousSeats: 5, seats: 8 });
  });

  it('ignores an event without previous items', () => {
    const event = createEvent();

    event.data.previous_attributes = {};
    expect(
      getBaseSeatChangeFromStripeSubscriptionEvent(event, ['prod_base']),
    ).toBeNull();
  });

  it('ignores a price change with the same quantity', () => {
    const event = createEvent();

    event.data.object.items.data[0].quantity = 5;
    event.data.object.items.data[0].price.id = 'price_new';
    expect(
      getBaseSeatChangeFromStripeSubscriptionEvent(event, ['prod_base']),
    ).toBeNull();
  });

  it('records a quantity change when switching base products', () => {
    const event = createEvent();

    event.data.object.items.data[0].price = {
      ...event.data.object.items.data[0].price,
      product: 'prod_organization',
    };
    expect(
      getBaseSeatChangeFromStripeSubscriptionEvent(event, [
        'prod_base',
        'prod_organization',
      ]),
    ).toEqual({ previousSeats: 5, seats: 8 });
  });

  it('ignores changes to non-base products', () => {
    expect(
      getBaseSeatChangeFromStripeSubscriptionEvent(createEvent(), [
        'prod_other',
      ]),
    ).toBeNull();
  });
});
