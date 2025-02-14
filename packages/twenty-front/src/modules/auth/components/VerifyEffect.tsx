import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useAuth } from '@/auth/hooks/useAuth';
import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { isAppWaitingForFreshObjectMetadataState } from '@/object-metadata/states/isAppWaitingForFreshObjectMetadataState';
import { AppPath } from '@/types/AppPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const VerifyEffect = () => {
  const [searchParams] = useSearchParams();
  const loginToken = searchParams.get('loginToken');
  const errorMessage = searchParams.get('errorMessage');

  const { enqueueSnackBar } = useSnackBar();

  const isLogged = useIsLogged();
  const navigate = useNavigateApp();

  const { getAuthTokensFromLoginToken } = useAuth();

  const setIsAppWaitingForFreshObjectMetadata = useSetRecoilState(
    isAppWaitingForFreshObjectMetadataState,
  );

  useEffect(() => {
    if (isDefined(errorMessage)) {
      enqueueSnackBar(errorMessage, {
        dedupeKey: 'get-auth-tokens-from-login-token-failed-dedupe-key',
        variant: SnackBarVariant.Error,
      });
    }

    if (isDefined(loginToken)) {
      setIsAppWaitingForFreshObjectMetadata(true);
      getAuthTokensFromLoginToken(loginToken);
    } else if (!isLogged) {
      navigate(AppPath.SignInUp);
    }
    // Verify only needs to run once at mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
};
