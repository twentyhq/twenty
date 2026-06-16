// Marker added to the Stripe payment-method-update portal return URL so that,
// once the card-less trial user comes back, the trial is ended automatically
// in place (no dedicated confirmation page, no redirection).
export const START_SUBSCRIPTION_AFTER_PAYMENT_METHOD_QUERY_PARAM =
  'startSubscriptionAfterPaymentMethod';
