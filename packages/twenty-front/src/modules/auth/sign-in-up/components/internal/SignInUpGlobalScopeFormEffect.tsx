import { useAuth } from '@/auth/hooks/useAuth';
import { useHasAccessTokenPair } from '@/auth/hooks/useHasAccessTokenPair';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLoadCurrentUser } from '@/users/hooks/useLoadCurrentUser';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

export const SignInUpGlobalScopeFormEffect = () => {
  const signInUpStep = useAtomStateValue(signInUpStepState);
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    getAuthTokensFromSSOExchangeToken,
    navigateAfterMultiWorkspaceSignInUp,
  } = useAuth();
  const { loadCurrentUser } = useLoadCurrentUser();
  const hasAccessTokenPair = useHasAccessTokenPair();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();

  // oxlint-disable-next-line twenty/no-state-useref
  const hasExchangedSSOTokenRef = useRef(false);

  useEffect(() => {
    const resumeOnCentralDomain = async () => {
      const { user } = await loadCurrentUser();
      await navigateAfterMultiWorkspaceSignInUp(
        user.availableWorkspaces,
        user.email,
      );
    };

    const ssoExchangeToken = searchParams.get('ssoExchangeToken');

    if (isDefined(ssoExchangeToken)) {
      if (hasExchangedSSOTokenRef.current) return;
      hasExchangedSSOTokenRef.current = true;

      searchParams.delete('ssoExchangeToken');
      setSearchParams(searchParams, { replace: true });

      void getAuthTokensFromSSOExchangeToken(ssoExchangeToken)
        .then(resumeOnCentralDomain)
        .catch(() => {
          enqueueErrorSnackBar({ message: t`Authentication failed` });
        });

      return;
    }

    if (hasExchangedSSOTokenRef.current) return;
    if (signInUpStep !== SignInUpStep.Init) return;
    if (!hasAccessTokenPair) return;

    void resumeOnCentralDomain();
  }, [
    searchParams,
    setSearchParams,
    loadCurrentUser,
    getAuthTokensFromSSOExchangeToken,
    signInUpStep,
    hasAccessTokenPair,
    navigateAfterMultiWorkspaceSignInUp,
    enqueueErrorSnackBar,
    t,
  ]);

  return <></>;
};
