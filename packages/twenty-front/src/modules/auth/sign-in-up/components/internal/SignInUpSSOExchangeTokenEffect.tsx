import { useRedeemSSOExchangeToken } from '@/auth/hooks/useRedeemSSOExchangeToken';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

export const SignInUpSSOExchangeTokenEffect = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { redeemSSOExchangeToken } = useRedeemSSOExchangeToken();

  useEffect(() => {
    const ssoExchangeToken = searchParams.get('ssoExchangeToken');

    if (!isDefined(ssoExchangeToken)) {
      return;
    }

    // Deleting in place also latches the redemption: StrictMode re-invokes this
    // effect with the same searchParams object, which no longer holds the token
    searchParams.delete('ssoExchangeToken');
    setSearchParams(searchParams, { replace: true });

    void redeemSSOExchangeToken(ssoExchangeToken);
  }, [searchParams, setSearchParams, redeemSSOExchangeToken]);

  return <></>;
};
