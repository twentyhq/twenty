import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRecoilValue } from 'recoil';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const useStripeLogin = () => {
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

  return { stripeLogin };
};
