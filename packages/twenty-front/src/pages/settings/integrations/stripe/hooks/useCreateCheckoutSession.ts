import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useStripePromise } from '~/pages/settings/integrations/stripe/hooks/useStripePromise';

export const useCreateCheckoutSession = () => {
  const { stripePromise } = useStripePromise();

  const createCheckoutSession = async (amount: number, currency: string) => {
    try {
      const response = await fetch(
        `${REACT_APP_SERVER_BASE_URL}/stripe/create-checkout-session`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            currency,
          }),
        },
      );
      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { id } = await response.json();
      const stripe = await stripePromise;

      if (!stripe) throw new Error('Stripe failed to load');

      await stripe.redirectToCheckout({ sessionId: id });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to accountIdcreate checkout session', error);
    }
  };

  return { createCheckoutSession };
};
