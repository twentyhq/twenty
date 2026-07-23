import { useRedeemSSOExchangeToken } from '@/auth/hooks/useRedeemSSOExchangeToken';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

export const SignInUpSSOExchangeTokenEffect = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { redeemSSOExchangeToken } = useRedeemSSOExchangeToken();

  useEffect(() => {
    // window.location is read live so a re-invoked effect reads the already
    // stripped fragment and cannot redeem the single use token twice
    const ssoExchangeToken = new URLSearchParams(
      window.location.hash.substring(1),
    ).get('ssoExchangeToken');

    if (!isDefined(ssoExchangeToken)) {
      return;
    }

    setSearchParams(searchParams, { replace: true });

    void redeemSSOExchangeToken(ssoExchangeToken);
  }, [searchParams, setSearchParams, redeemSSOExchangeToken]);

  return <></>;
};
