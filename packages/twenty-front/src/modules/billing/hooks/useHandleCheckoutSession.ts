import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import { useRef, useState } from 'react';
import {
  type BillingPlanKey,
  type SubscriptionInterval,
  useCheckoutSessionMutation,
} from '~/generated-metadata/graphql';

export const useHandleCheckoutSession = ({
  recurringInterval,
  plan,
  requirePaymentMethod,
  successUrlPath,
}: {
  recurringInterval: SubscriptionInterval;
  plan: BillingPlanKey;
  requirePaymentMethod: boolean;
  successUrlPath: string;
}) => {
  const { redirect } = useRedirect();

  const { enqueueErrorSnackBar } = useSnackBar();

  const [checkoutSession] = useCheckoutSessionMutation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const handleCheckoutSession = async () => {
    if (isSubmittingRef.current) {
      return;
    }
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    const { data } = await checkoutSession({
      variables: {
        recurringInterval,
        successUrlPath,
        plan,
        requirePaymentMethod,
      },
    });
    if (!data?.checkoutSession.url) {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      enqueueErrorSnackBar({
        message: t`Checkout session error. Please retry or contact Twenty team`,
      });
      return;
    }
    redirect(data.checkoutSession.url);
  };
  return { isSubmitting, handleCheckoutSession };
};
