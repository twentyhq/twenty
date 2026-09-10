import { isAppEffectRedirectEnabledState } from '@/app/states/isAppEffectRedirectEnabledState';
import { useAuth } from '@/auth/hooks/useAuth';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useLingui } from '@lingui/react/macro';
import { AppPath } from 'twenty-shared/types';
import { useToast } from 'twenty-ui/feedback';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useVerifyLogin = () => {
  const { enqueueToast } = useToast();
  const navigate = useNavigateApp();
  const setIsAppEffectRedirectEnabled = useSetAtomState(
    isAppEffectRedirectEnabledState,
  );
  const { getAuthTokensFromLoginToken } = useAuth();
  const { t } = useLingui();

  const verifyLoginToken = async (loginToken: string) => {
    // Keeps PageChangeEffect from consuming returnToPath mid token swap
    setIsAppEffectRedirectEnabled(false);
    try {
      await getAuthTokensFromLoginToken(loginToken);
    } catch (error) {
      if (CombinedGraphQLErrors.is(error)) {
        enqueueToast(getToastOptionsFromError({ error }));
      } else {
        enqueueToast({ variant: 'error', children: t`Authentication failed` });
      }
      navigate(AppPath.SignInUp);
    } finally {
      setIsAppEffectRedirectEnabled(true);
    }
  };

  return { verifyLoginToken };
};
