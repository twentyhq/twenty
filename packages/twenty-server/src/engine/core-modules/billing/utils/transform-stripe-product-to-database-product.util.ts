/* @license Enterprise */

import type Stripe from 'stripe';

export const transformStripeProductToDatabaseProduct = (
  data: Stripe.Product,
) => {
  return {
    stripeProductId: data.id,
    name: data.name,
    active: data.active,
    description: data.description ?? '',
    images: data.images,
    marketingFeatures: data.marketing_features,
    defaultStripePriceId: data.default_price
      ? String(data.default_price)
      : undefined,
    unitLabel: data.unit_label === null ? undefined : data.unit_label,
    Url: data.Url === null ? undefined : data.Url,
    taxCode: data.tax_code ? String(data.tax_code) : undefined,
    metadata: data.metadata,
  };
};
