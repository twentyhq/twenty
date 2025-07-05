import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import {
  BillingPlanKey,
  SubscriptionInterval,
  useCheckoutSessionMutation,
} from '~/generated-metadata/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const useHandleCheckoutSession = ({
  recurringInterval,
  plan,
  requirePaymentMethod,
}: {
  recurringInterval: SubscriptionInterval;
  plan: BillingPlanKey;
  requirePaymentMethod: boolean;
}) => {
  const { redirect } = useRedirect();

  const { enqueueErrorSnackBar } = useSnackBar();

  const [checkoutSession] = useCheckoutSessionMutation();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckoutSession = async () => {
    setIsSubmitting(true);
    const { data } = await checkoutSession({
      variables: {
        recurringInterval,
        successUrlPath: getSettingsPath(SettingsPath.Billing),
        plan,
        requirePaymentMethod,
      },
    });
    setIsSubmitting(false);
    if (!data?.checkoutSession.url) {
      enqueueErrorSnackBar({
        message: t`Checkout session error. Please retry or contact Twenty team`,
      });
      return;
    }
    redirect(data.checkoutSession.url);
  };
  return { isSubmitting, handleCheckoutSession };
};
