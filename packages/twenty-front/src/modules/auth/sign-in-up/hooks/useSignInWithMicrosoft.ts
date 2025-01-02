import { useParams, useSearchParams } from 'react-router-dom';

import { useAuth } from '@/auth/hooks/useAuth';
import { billingCheckoutSessionState } from '@/auth/states/billingCheckoutSessionState';
import { useRecoilValue } from 'recoil';

export const useSignInWithMicrosoft = () => {
  const workspaceInviteHash = useParams().workspaceInviteHash;
  const [searchParams] = useSearchParams();
  const workspacePersonalInviteToken =
    searchParams.get('inviteToken') ?? undefined;
  const billingCheckoutSession = useRecoilValue(billingCheckoutSessionState);

  const { signInWithMicrosoft } = useAuth();
  return {
    signInWithMicrosoft: () =>
      signInWithMicrosoft({
        workspaceInviteHash,
        workspacePersonalInviteToken,
        billingCheckoutSession,
      }),
  };
};
