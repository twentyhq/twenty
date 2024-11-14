import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useAuth } from '@/auth/hooks/useAuth';
import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { AppPath } from '@/types/AppPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { isDefined } from '~/utils/isDefined';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';

export const VerifyEffect = () => {
  const { enqueueSnackBar } = useSnackBar();

  const [searchParams] = useSearchParams();
  const loginToken = searchParams.get('loginToken');
  const errorMessage = searchParams.get('errorMessage');

  const isLogged = useIsLogged();
  const navigate = useNavigate();

  const { verify } = useAuth();

  useEffect(() => {
    const getTokens = async () => {
      if (!loginToken) {
        navigate(AppPath.SignInUp);
      } else {
        await verify(loginToken);
      }
    };

    if (!isLogged) {
      getTokens();
    }
    // Verify only needs to run once at mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // TODO AMOREAUX: the error message it display twice. Need help to fix it
    if (isDefined(errorMessage)) {
      enqueueSnackBar(errorMessage, {
        variant: SnackBarVariant.Error,
      });
    }
  }, []);

  return <></>;
};
