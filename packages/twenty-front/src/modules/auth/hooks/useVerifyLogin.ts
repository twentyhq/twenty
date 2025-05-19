import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';

import { useAuth } from '@/auth/hooks/useAuth';
import { AppPath } from '@/types/AppPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useLingui } from '@lingui/react/macro';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useVerifyLogin = () => {
  const { enqueueSnackBar } = useSnackBar();
  const navigate = useNavigateApp();
  const { getAuthTokensFromLoginToken } = useAuth();
  const { t } = useLingui();

  const verifyLoginToken = async (loginToken: string) => {
    try {
      await getAuthTokensFromLoginToken(loginToken);
    } catch (error) {
      enqueueSnackBar(t`Authentication failed`, {
        variant: SnackBarVariant.Error,
      });
      navigate(AppPath.SignInUp);
    }
  };

  return { verifyLoginToken };
};
