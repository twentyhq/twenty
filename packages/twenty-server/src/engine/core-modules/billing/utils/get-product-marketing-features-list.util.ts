import Stripe from 'stripe';

export const getMarketingFeaturesList = (
  featers?: Stripe.Product.MarketingFeature[],
) =>
  featers && featers.length > 0
    ? featers.map((feat) => feat?.name || null)
    : null;
