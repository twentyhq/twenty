import { useAuth } from '@/auth/hooks/useAuth';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { AppPath } from 'twenty-shared/types';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useVerifyLogin = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const navigate = useNavigateApp();
  const { getAuthTokensFromLoginToken } = useAuth();
  const { t } = useLingui();

  const verifyLoginToken = async (loginToken: string) => {
    try {
      await getAuthTokensFromLoginToken(loginToken);
    } catch {
      enqueueErrorSnackBar({
        message: t`Authentication failed`,
      });
      navigate(AppPath.SignInUp);
    }
  };

  return { verifyLoginToken };
};
