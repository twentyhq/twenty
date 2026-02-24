import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { useVerifyLogin } from '@/auth/hooks/useVerifyLogin';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const VerifyLoginTokenEffect = () => {
  const [searchParams] = useSearchParams();
  const loginToken = searchParams.get('loginToken');

  const isLogged = useIsLogged();
  const navigate = useNavigateApp();
  const { verifyLoginToken } = useVerifyLogin();

  const { isSaved: clientConfigLoaded } = useRecoilValueV2(
    clientConfigApiStatusState,
  );

  console.log('[VerifyLoginToken] state:', {
    clientConfigLoaded,
    hasLoginToken: isDefined(loginToken),
    isLogged,
  });

  useEffect(() => {
    if (!clientConfigLoaded) {
      console.log('[VerifyLoginToken] effect: waiting for client config');
      return;
    }

    if (isDefined(loginToken)) {
      console.log('[VerifyLoginToken] effect: verifying login token');
      verifyLoginToken(loginToken);
    } else if (!isLogged) {
      console.log(
        '[VerifyLoginToken] effect: no token, not logged, redirecting to sign-in',
      );
      navigate(AppPath.SignInUp);
    } else {
      console.log('[VerifyLoginToken] effect: already logged in, no token');
    }
    // Verify only needs to run once at mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientConfigLoaded]);

  return <></>;
};
