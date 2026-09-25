import { useAuth } from '@/auth/hooks/useAuth';
import { useIsLogged } from '@/auth/hooks/useIsLogged';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLoadCurrentUser } from '@/users/hooks/useLoadCurrentUser';
import { useEffect, useState } from 'react';

export const SignInUpGlobalScopeFormEffect = () => {
  const signInUpStep = useAtomStateValue(signInUpStepState);
  const { navigateAfterMultiWorkspaceSignInUp } = useAuth();
  const { loadCurrentUser } = useLoadCurrentUser();
  const isLogged = useIsLogged();

  // A session that starts on this page is a social SSO sign-in, not a resume
  const [isResumingSession] = useState(isLogged);

  useEffect(() => {
    const resumeOnCentralDomain = async () => {
      const { user } = await loadCurrentUser();
      await navigateAfterMultiWorkspaceSignInUp({
        availableWorkspaces: user.availableWorkspaces,
        email: user.email,
        isResumingSession,
      });
    };

    if (signInUpStep !== SignInUpStep.Init) return;
    if (!isLogged) return;

    void resumeOnCentralDomain();
  }, [
    loadCurrentUser,
    signInUpStep,
    isLogged,
    isResumingSession,
    navigateAfterMultiWorkspaceSignInUp,
  ]);

  return <></>;
};
