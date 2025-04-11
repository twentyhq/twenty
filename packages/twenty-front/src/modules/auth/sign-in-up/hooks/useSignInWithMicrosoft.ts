import { useParams, useSearchParams } from 'react-router-dom';

import { useAuth } from '@/auth/hooks/useAuth';
import { billingCheckoutSessionURLParamState } from '@/auth/states/billingCheckoutSessionURLParamState';
import { useRecoilValue } from 'recoil';

export const useSignInWithMicrosoft = () => {
  const workspaceInviteHash = useParams().workspaceInviteHash;
  const [searchParams] = useSearchParams();
  const workspacePersonalInviteToken =
    searchParams.get('inviteToken') ?? undefined;
  const billingCheckoutSession = useRecoilValue(billingCheckoutSessionURLParamState);

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
