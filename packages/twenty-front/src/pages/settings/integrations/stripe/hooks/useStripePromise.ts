import { loadStripe } from '@stripe/stripe-js';

export const useStripePromise = () => {
  const key = import.meta.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

  console.log(key);

  if (!key) throw new Error('Missing REACT_APP_STRIPE_PUBLISHABLE_KEY .env');

  const stripePromise = loadStripe(key);

  return { stripePromise };
};
