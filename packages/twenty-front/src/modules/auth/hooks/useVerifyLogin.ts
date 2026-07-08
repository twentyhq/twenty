import { isAppEffectRedirectEnabledState } from '@/app/states/isAppEffectRedirectEnabledState';
import { useAuth } from '@/auth/hooks/useAuth';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLingui } from '@lingui/react/macro';
import { AppPath } from 'twenty-shared/types';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useVerifyLogin = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const navigate = useNavigateApp();
  const setTokenPair = useSetAtomState(tokenPairState);
  const setIsAppEffectRedirectEnabled = useSetAtomState(
    isAppEffectRedirectEnabledState,
  );
  const { getAuthTokensFromLoginToken } = useAuth();
  const { t } = useLingui();

  const verifyLoginToken = async (loginToken: string) => {
    // Keeps PageChangeEffect from consuming returnToPath mid token swap
    setIsAppEffectRedirectEnabled(false);
    setTokenPair(null);
    try {
      await getAuthTokensFromLoginToken(loginToken);
    } catch {
      enqueueErrorSnackBar({
        message: t`Authentication failed`,
      });
      navigate(AppPath.SignInUp);
    } finally {
      setIsAppEffectRedirectEnabled(true);
    }
  };

  return { verifyLoginToken };
};
