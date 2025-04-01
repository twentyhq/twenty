import { useParams, useSearchParams } from 'react-router-dom';

import { useAuth } from '@/auth/hooks/useAuth';
import { BillingCheckoutSession } from '@/auth/types/billingCheckoutSession.type';

export const useSignInWithGitHub = () => {
  const workspaceInviteHash = useParams().workspaceInviteHash;
  const [searchParams] = useSearchParams();
  const workspacePersonalInviteToken =
    searchParams.get('inviteToken') ?? undefined;
  const billingCheckoutSessionState = {
    plan: 'PRO',
    interval: 'Month',
    requirePaymentMethod: true,
  } as BillingCheckoutSession;

  const { signInWithGitHub } = useAuth();
  return {
    signInWithGitHub: () =>
      signInWithGitHub({
        workspaceInviteHash,
        workspacePersonalInviteToken,
        billingCheckoutSession: billingCheckoutSessionState,
      }),
  };
};