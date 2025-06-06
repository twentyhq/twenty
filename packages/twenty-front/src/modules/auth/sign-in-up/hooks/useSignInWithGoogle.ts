import { useParams, useSearchParams } from 'react-router-dom';

import { useAuth } from '@/auth/hooks/useAuth';
import { BillingCheckoutSession } from '@/auth/types/billingCheckoutSession.type';
import { SocialSSOSignInUpActionType } from '@/auth/types/socialSSOSignInUp.type';

export const useSignInWithGoogle = () => {
  const workspaceInviteHash = useParams().workspaceInviteHash;
  const [searchParams] = useSearchParams();
  const workspacePersonalInviteToken =
    searchParams.get('inviteToken') ?? undefined;
  const billingCheckoutSession = {
    plan: 'PRO',
    interval: 'Month',
    requirePaymentMethod: true,
  } as BillingCheckoutSession;

  const { signInWithGoogle } = useAuth();

  return {
    signInWithGoogle: ({ action }: { action: SocialSSOSignInUpActionType }) =>
      signInWithGoogle({
        workspaceInviteHash,
        workspacePersonalInviteToken,
        billingCheckoutSession,
        action,
      }),
  };
};
