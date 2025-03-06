import { loadStripe } from '@stripe/stripe-js';

export const useStripePromise = () => {
  const key = import.meta.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

  if (!key) throw new Error('Missing REACT_APP_STRIPE_PUBLISHABLE_KEY .env');

  console.log(key);

  const stripePromise = loadStripe(key);

  return { stripePromise };
};
