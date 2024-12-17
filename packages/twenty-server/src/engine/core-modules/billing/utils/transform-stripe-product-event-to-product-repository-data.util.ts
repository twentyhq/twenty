import Stripe from 'stripe';

export const transformStripeProductEventToProductRepositoryData = (
  data: Stripe.ProductUpdatedEvent.Data | Stripe.ProductCreatedEvent.Data,
) => {
  return {
    stripeProductId: data.object.id,
    name: data.object.name,
    active: data.object.active,
    description: data.object.description,
    images: data.object.images,
    marketingFeatures: data.object.marketing_features,
    defaultStripePriceId: data.object.default_price
      ? String(data.object.default_price)
      : undefined,
    unitLabel: data.object.unit_label ?? undefined,
    url: data.object.url ?? undefined,
    taxCode: data.object.tax_code ? String(data.object.tax_code) : undefined,
  };
};
