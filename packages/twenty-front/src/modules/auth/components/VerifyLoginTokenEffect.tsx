import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { useVerifyLogin } from '@/auth/hooks/useVerifyLogin';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { useRecoilValue } from 'recoil';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const VerifyLoginTokenEffect = () => {
  const [searchParams] = useSearchParams();
  const loginToken = searchParams.get('loginToken');

  const isLogged = useIsLogged();
  const navigate = useNavigateApp();
  const { verifyLoginToken } = useVerifyLogin();

  const { isSaved: clientConfigLoaded } = useRecoilValue(
    clientConfigApiStatusState,
  );

  useEffect(() => {
    if (!clientConfigLoaded) return;

    if (isDefined(loginToken)) {
      verifyLoginToken(loginToken);
    } else if (!isLogged) {
      navigate(AppPath.SignInUp);
    }
    // Verify only needs to run once at mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientConfigLoaded]);

  return <></>;
};
