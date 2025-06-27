import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';

import { useAuth } from '@/auth/hooks/useAuth';
import { AppPath } from '@/types/AppPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { AuthToken } from '~/generated/graphql';

export const useVerifyLogin = () => {
  const { enqueueSnackBar } = useSnackBar();
  const navigate = useNavigateApp();
  const { getAuthTokensFromLoginToken } = useAuth();

  const verifyLoginToken = async (loginToken: AuthToken['token']) => {
    try {
      await getAuthTokensFromLoginToken(loginToken);
    } catch (error: any) {
      enqueueSnackBar(error?.message, {
        variant: SnackBarVariant.Error,
      });
      navigate(AppPath.SignInUp);
    }
  };

  return { verifyLoginToken };
};
