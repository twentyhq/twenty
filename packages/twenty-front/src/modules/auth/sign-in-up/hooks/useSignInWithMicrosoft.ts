import { useParams, useSearchParams } from 'react-router-dom';

import { useAuth } from '@/auth/hooks/useAuth';
import { billingCheckoutSessionState } from '@/auth/states/billingCheckoutSessionState';
import { type SocialSSOSignInUpActionType } from '@/auth/types/socialSSOSignInUp.type';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';

export const useSignInWithMicrosoft = () => {
  const workspaceInviteHash = useParams().workspaceInviteHash;
  const [searchParams] = useSearchParams();
  const workspacePersonalInviteToken =
    searchParams.get('inviteToken') ?? undefined;
  const billingCheckoutSession = useAtomValue(billingCheckoutSessionState);

  const { signInWithMicrosoft } = useAuth();
  return {
    signInWithMicrosoft: ({
      action,
    }: {
      action: SocialSSOSignInUpActionType;
    }) =>
      signInWithMicrosoft({
        workspaceInviteHash,
        workspacePersonalInviteToken,
        billingCheckoutSession,
        action,
      }),
  };
};
