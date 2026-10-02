import { useRedeemSsoExchangeToken } from '@/auth/hooks/useRedeemSsoExchangeToken';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const SignInUpSsoExchangeTokenEffect = () => {
  const { redeemSsoExchangeToken } = useRedeemSsoExchangeToken();

  useEffect(() => {
    const ssoExchangeToken = new URLSearchParams(
      window.location.hash.substring(1),
    ).get('ssoExchangeToken');

    if (!isDefined(ssoExchangeToken)) {
      return;
    }

    // Synchronous strip (the router defers replace) so re-run or remounted effects find no token
    window.history.replaceState(
      window.history.state,
      '',
      window.location.pathname + window.location.search,
    );

    void redeemSsoExchangeToken(ssoExchangeToken);
  }, [redeemSsoExchangeToken]);

  return <></>;
};
