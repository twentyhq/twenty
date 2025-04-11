import { useParams, useSearchParams } from 'react-router-dom';

import { useAuth } from '@/auth/hooks/useAuth';
import { billingCheckoutSessionURLState } from '@/auth/states/billingCheckoutSessionURLState';
import { useRecoilValue } from 'recoil';

export const useSignInWithMicrosoft = () => {
  const workspaceInviteHash = useParams().workspaceInviteHash;
  const [searchParams] = useSearchParams();
  const workspacePersonalInviteToken =
    searchParams.get('inviteToken') ?? undefined;
  const billingCheckoutSession = useRecoilValue(billingCheckoutSessionURLState);

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
