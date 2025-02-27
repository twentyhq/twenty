import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { createContext, FC, ReactNode } from 'react';
import { useRecoilValue } from 'recoil';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useStripePromise } from '~/pages/settings/integrations/stripe/hooks/useStripePromise';

export type StripeIntegrationContextType = {
  stripeLogin: () => void;
  createCheckoutSession: (amount: number, currency: string) => Promise<void>;
};

export const StripeContext = createContext<StripeIntegrationContextType | null>(
  null,
);

const StripeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { stripePromise } = useStripePromise();

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const stripeLogin = async () => {
    try {
      const response = await fetch(
        `${REACT_APP_SERVER_BASE_URL}/stripe/account`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workspaceId: currentWorkspace?.id }),
        },
      );
      if (!response.ok) {
        throw new Error('Failed to create account');
      }
      const accountData = await response.json();

      const loginResponse = await fetch(
        `${REACT_APP_SERVER_BASE_URL}/stripe/account_link`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            account: accountData.account,
            workspaceId: currentWorkspace?.id,
          }),
        },
      );
      if (!loginResponse.ok) {
        throw new Error('Failed to create account link');
      }
      const { url } = await loginResponse.json();

      localStorage.setItem('accountId', accountData.account);
      localStorage.setItem('accountData', JSON.stringify(accountData));

      window.location.href = url;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

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

  return (
    <StripeContext.Provider value={{ stripeLogin, createCheckoutSession }}>
      {children}
    </StripeContext.Provider>
  );
};

export default StripeProvider;
