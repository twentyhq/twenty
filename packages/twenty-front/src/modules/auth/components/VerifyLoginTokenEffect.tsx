import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { useVerifyLogin } from '@/auth/hooks/useVerifyLogin';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { AppPath } from '@/types/AppPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const VerifyLoginTokenEffect = () => {
  const [searchParams] = useSearchParams();
  const loginToken = searchParams.get('loginToken');
  const errorMessage = searchParams.get('errorMessage');

  const { enqueueSnackBar } = useSnackBar();
  const isLogged = useIsLogged();
  const navigate = useNavigateApp();
  const { verifyLoginToken } = useVerifyLogin();

  const { isLoaded: clientConfigLoaded } = useRecoilValue(
    clientConfigApiStatusState,
  );

  useEffect(() => {
    if (isDefined(errorMessage)) {
      enqueueSnackBar(errorMessage, {
        dedupeKey: 'get-auth-tokens-from-login-token-failed-dedupe-key',
        variant: SnackBarVariant.Error,
      });
    }

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
