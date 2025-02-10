import { createContext, FC, ReactNode, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useRecoilValue } from 'recoil';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { stripePublishableKey } from '~/pages/settings/integrations/stripe/key/stripeKeys';

const stripePromise = loadStripe(stripePublishableKey());

export type StripeIntegrationContextType = {
  stripeLogin: () => void;
  createCheckoutSession: (amount: number, currency: string) => Promise<void>;
};

export const StripeContext = createContext<StripeIntegrationContextType | null>(
  null,
);

const StripeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [accountCreatePending, SetAccountCreatePending] =
    useState<boolean>(false);
  const [accountId, setAccountId] = useState(null);
  const [accountData, setAccountData] = useState<string | undefined>(undefined);

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  console.log('work', currentWorkspace?.id);

  const stripeLogin = async () => {
    SetAccountCreatePending(true);
    try {
      const response = await fetch('http://crm.kvoip.com.br/stripe/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: currentWorkspace?.id }),
      });
      if (!response.ok) {
        throw new Error('Failed to create account');
      }
      const accountData = await response.json();
      setAccountId(accountData.account);
      setAccountData(JSON.stringify(accountData));

      const loginResponse = await fetch(
        'http://crm.kvoip.com.br/stripe/account_link',
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
      console.error(e);
    } finally {
      SetAccountCreatePending(false);
    }
  };

  const createCheckoutSession = async (amount: number, currency: string) => {
    try {
      const response = await fetch(
        'http://crm.kvoip.com.br/stripe/create-checkout-session',
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
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId: id });
      } else {
        console.error('Stripe failed to load');
      }
    } catch (error) {
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
