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
    unitLabel:
      data.object.unit_label === null ? undefined : data.object.unit_label,
    url: data.object.url === null ? undefined : data.object.url,
    taxCode: data.object.tax_code ? String(data.object.tax_code) : undefined,
  };
};
