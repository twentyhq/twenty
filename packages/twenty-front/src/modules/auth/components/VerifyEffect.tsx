import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useAuth } from '@/auth/hooks/useAuth';
import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { isAppWaitingForFreshObjectMetadataState } from '@/object-metadata/states/isAppWaitingForFreshObjectMetadataState';
import { AppPath } from '@/types/AppPath';
import { useSetRecoilState } from 'recoil';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { isDefined } from 'twenty-ui';

export const VerifyEffect = () => {
  const [searchParams] = useSearchParams();
  const loginToken = searchParams.get('loginToken');
  const errorMessage = searchParams.get('errorMessage');

  const { enqueueSnackBar } = useSnackBar();

  const isLogged = useIsLogged();
  const navigate = useNavigate();

  const { verify } = useAuth();

  const setIsAppWaitingForFreshObjectMetadata = useSetRecoilState(
    isAppWaitingForFreshObjectMetadataState,
  );

  useEffect(() => {
    const getTokens = async () => {
      if (isDefined(errorMessage)) {
        enqueueSnackBar(errorMessage, {
          variant: SnackBarVariant.Error,
        });
      }
      if (!loginToken) {
        navigate(AppPath.SignInUp);
      } else {
        setIsAppWaitingForFreshObjectMetadata(true);
        await verify(loginToken);
      }
    };

    if (!isLogged) {
      getTokens();
    }
    // Verify only needs to run once at mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <></>;
};
