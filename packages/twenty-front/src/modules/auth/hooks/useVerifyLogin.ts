import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';

import { useAuth } from '@/auth/hooks/useAuth';
import { isAppWaitingForFreshObjectMetadataState } from '@/object-metadata/states/isAppWaitingForFreshObjectMetadataState';
import { AppPath } from '@/types/AppPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useSetRecoilState } from 'recoil';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useVerifyLogin = () => {
  const { enqueueSnackBar } = useSnackBar();
  const navigate = useNavigateApp();
  const { getAuthTokensFromLoginToken } = useAuth();

  const setIsAppWaitingForFreshObjectMetadata = useSetRecoilState(
    isAppWaitingForFreshObjectMetadataState,
  );

  const verifyLoginToken = async (loginToken: string) => {
    try {
      setIsAppWaitingForFreshObjectMetadata(true);
      await getAuthTokensFromLoginToken(loginToken);
    } catch (error) {
      enqueueSnackBar('Authentication failed', {
        variant: SnackBarVariant.Error,
      });
      navigate(AppPath.SignInUp);
    } finally {
      setIsAppWaitingForFreshObjectMetadata(false);
    }
  };

  return { verifyLoginToken };
};
