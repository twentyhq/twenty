import { useParams, useSearchParams } from 'react-router-dom';

import { useAuth } from '@/auth/hooks/useAuth';
import { type BillingCheckoutSession } from '@/auth/types/BillingCheckoutSession';
import { type SocialSsoSignInUpActionType } from '@/auth/types/SocialSsoSignInUpActionType';
import {
  BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';

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
    signInWithGoogle: ({ action }: { action: SocialSsoSignInUpActionType }) =>
      signInWithGoogle({
        workspaceInviteHash,
        workspacePersonalInviteToken,
        billingCheckoutSession,
        action,
      }),
  };
};
