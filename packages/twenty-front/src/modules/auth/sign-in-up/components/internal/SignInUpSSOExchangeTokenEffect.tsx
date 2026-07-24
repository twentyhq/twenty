import { useRedeemSSOExchangeToken } from '@/auth/hooks/useRedeemSSOExchangeToken';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const SignInUpSSOExchangeTokenEffect = () => {
  const { redeemSSOExchangeToken } = useRedeemSSOExchangeToken();

  useEffect(() => {
    const ssoExchangeToken = new URLSearchParams(
      window.location.hash.substring(1),
    ).get('ssoExchangeToken');

    if (!isDefined(ssoExchangeToken)) {
      return;
    }

    // Stripping synchronously through window.history rather than the router
    // (whose data-router navigations defer the replace) latches re-invoked and
    // remounted effects out: they re-read window.location and find no token
    window.history.replaceState(
      window.history.state,
      '',
      window.location.pathname + window.location.search,
    );

    void redeemSSOExchangeToken(ssoExchangeToken);
  }, [redeemSSOExchangeToken]);

  return <></>;
};
