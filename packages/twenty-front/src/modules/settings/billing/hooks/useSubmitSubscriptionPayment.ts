import { useErrorToast } from '@/error-handler/hooks/useErrorToast';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useElements, useStripe } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/feedback';
import {
  type BillingPlanKey,
  type SubscriptionInterval,
  CreateSubscriptionPaymentIntentDocument,
} from '~/generated-metadata/graphql';

type UseSubmitSubscriptionPaymentParams = {
  plan: BillingPlanKey;
  recurringInterval: SubscriptionInterval;
};

export const useSubmitSubscriptionPayment = ({
  plan,
  recurringInterval,
}: UseSubmitSubscriptionPaymentParams) => {
  const stripe = useStripe();
  const elements = useElements();
  const { add: addToast } = useToast();
  const { addErrorToast } = useErrorToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createSubscriptionPaymentIntent] = useMutation(
    CreateSubscriptionPaymentIntentDocument,
  );

  const isStripeReady = isDefined(stripe) && isDefined(elements);

  const submit = async () => {
    if (!isDefined(stripe) || !isDefined(elements)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: submitError } = await elements.submit();
      if (isDefined(submitError)) {
        addToast({
          variant: 'error',
          children:
            submitError.message ??
            t`Your payment details are incomplete. Please review and retry.`,
        });
        setIsSubmitting(false);
        return;
      }

      const idempotencyKey = crypto.randomUUID();
      const { data } = await createSubscriptionPaymentIntent({
        variables: { recurringInterval, plan, idempotencyKey },
      });

      const paymentIntent = data?.createSubscriptionPaymentIntent;
      if (!isDefined(paymentIntent?.clientSecret)) {
        addToast({
          variant: 'error',
          children: t`Subscription error. Please retry or contact Twenty team`,
        });
        setIsSubmitting(false);
        return;
      }

      const returnUrl = new URL(
        AppPath.PlanRequiredSuccess,
        window.location.origin,
      ).toString();

      const { error } =
        paymentIntent.paymentIntentType === 'setup'
          ? await stripe.confirmSetup({
              elements,
              clientSecret: paymentIntent.clientSecret,
              confirmParams: { return_url: returnUrl },
            })
          : await stripe.confirmPayment({
              elements,
              clientSecret: paymentIntent.clientSecret,
              confirmParams: { return_url: returnUrl },
            });

      if (isDefined(error)) {
        addToast({
          variant: 'error',
          children:
            error.message ??
            t`We couldn't confirm your payment method. Please retry.`,
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      if (CombinedGraphQLErrors.is(error)) {
        addErrorToast(error);
      } else {
        addToast({
          variant: 'error',
          children: t`Subscription error. Please retry or contact Twenty team`,
        });
      }
      setIsSubmitting(false);
    }
  };

  return { submit, isSubmitting, isStripeReady };
};
