import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useToast } from 'twenty-ui/feedback';
import {
  type BillingPlanKey,
  type SubscriptionInterval,
  CheckoutSessionDocument,
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

  const { enqueueToast } = useToast();

  const [checkoutSession] = useMutation(CheckoutSessionDocument);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckoutSession = async () => {
    setIsSubmitting(true);
    try {
      const { data } = await checkoutSession({
        variables: {
          recurringInterval,
          successUrlPath,
          plan,
          requirePaymentMethod,
        },
      });
      if (!data?.checkoutSession.url) {
        enqueueToast({
          variant: 'error',
          children: t`Checkout session error. Please retry or contact Twenty team`,
        });
        return;
      }
      redirect(data.checkoutSession.url);
    } catch {
      enqueueToast({
        variant: 'error',
        children: t`Checkout session error. Please retry or contact Twenty team`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return { isSubmitting, handleCheckoutSession };
};
