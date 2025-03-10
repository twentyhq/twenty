import { loadStripe } from '@stripe/stripe-js';
import { REACT_APP_STRIPE_PUBLISHABLE_KEY } from '~/config';

export const useStripePromise = () => {
  if (!REACT_APP_STRIPE_PUBLISHABLE_KEY)
    throw new Error('App missing Stripe environment configuration.');

  const stripePromise = loadStripe(REACT_APP_STRIPE_PUBLISHABLE_KEY);

  return { stripePromise };
};
