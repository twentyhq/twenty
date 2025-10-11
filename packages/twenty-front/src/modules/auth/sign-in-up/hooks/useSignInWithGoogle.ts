import { useParams, useSearchParams } from 'react-router-dom';

import { useAuth } from '@/auth/hooks/useAuth';
import { type BillingCheckoutSession } from '@/auth/types/billingCheckoutSession.type';
import { type SocialSSOSignInUpActionType } from '@/auth/types/socialSSOSignInUp.type';
import { BillingPlanKey } from '~/generated/graphql';
import { SubscriptionInterval } from '~/generated-metadata/graphql';

export const useSignInWithGoogle = () => {
  const workspaceInviteHash = useParams().workspaceInviteHash;
  const [searchParams] = useSearchParams();
  const workspacePersonalInviteToken =
    searchParams.get('inviteToken') ?? undefined;
  const billingCheckoutSession = {
    plan: BillingPlanKey.PRO,
    interval: SubscriptionInterval.Month,
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
