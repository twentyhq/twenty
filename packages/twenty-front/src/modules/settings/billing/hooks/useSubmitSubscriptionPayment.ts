import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { buildStripeConfirmationOptions } from '@/settings/billing/utils/buildStripeConfirmationOptions';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useElements, useStripe } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';
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
  const { enqueueToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createSubscriptionPaymentIntent] = useMutation(
    CreateSubscriptionPaymentIntentDocument,
  );

  const isStripeReady = isDefined(stripe) && isDefined(elements);

  const submit = async (walletConfirmationTokenId?: string) => {
    if (!isDefined(stripe) || !isDefined(elements)) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (!isDefined(walletConfirmationTokenId)) {
        const { error: submitError } = await elements.submit();
        if (isDefined(submitError)) {
          enqueueToast({
            variant: 'error',
            children:
              submitError.message ??
              t`Your payment details are incomplete. Please review and retry.`,
          });
          setIsSubmitting(false);
          return;
        }
      }

      const idempotencyKey = crypto.randomUUID();
      const { data } = await createSubscriptionPaymentIntent({
        variables: { recurringInterval, plan, idempotencyKey },
      });

      const paymentIntent = data?.createSubscriptionPaymentIntent;
      if (!isDefined(paymentIntent?.clientSecret)) {
        enqueueToast({
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

      const confirmationOptions = buildStripeConfirmationOptions({
        elements,
        walletConfirmationTokenId,
        returnUrl,
      });

      const { error } =
        paymentIntent.paymentIntentType === 'setup'
          ? await stripe.confirmSetup({
              ...confirmationOptions,
              clientSecret: paymentIntent.clientSecret,
            })
          : await stripe.confirmPayment({
              ...confirmationOptions,
              clientSecret: paymentIntent.clientSecret,
            });

      if (isDefined(error)) {
        enqueueToast({
          variant: 'error',
          children:
            error.message ??
            t`We couldn't confirm your payment method. Please retry.`,
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      if (CombinedGraphQLErrors.is(error)) {
        enqueueToast(getToastOptionsFromError({ error }));
      } else {
        enqueueToast({
          variant: 'error',
          children: t`Subscription error. Please retry or contact Twenty team`,
        });
      }
      setIsSubmitting(false);
    }
  };

  return { submit, isSubmitting, isStripeReady };
};
