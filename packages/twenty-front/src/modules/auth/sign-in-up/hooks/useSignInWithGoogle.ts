import { useParams, useSearchParams } from 'react-router-dom';

import { useAuth } from '@/auth/hooks/useAuth';
import { BillingCheckoutSession } from '@/auth/types/billingCheckoutSession.type';

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
    signInWithGoogle: ({
      action,
    }: {
      action:
        | 'create-new-workspace'
        | 'list-available-workspace'
        | 'join-workspace';
    }) =>
      signInWithGoogle({
        workspaceInviteHash,
        workspacePersonalInviteToken,
        billingCheckoutSession,
        action,
      }),
  };
};
