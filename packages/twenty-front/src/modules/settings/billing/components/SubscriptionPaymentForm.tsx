import { currentUserState } from '@/auth/states/currentUserState';
import { useStripeAppearance } from '@/settings/billing/hooks/useStripeAppearance';
import { useStripePromise } from '@/settings/billing/hooks/useStripePromise';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { useState } from 'react';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Info, Loader } from 'twenty-ui/feedback';
import { MainButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  type BillingPlanKey,
  type SubscriptionInterval,
  CreateSubscriptionPaymentIntentDocument,
} from '~/generated-metadata/graphql';

type SubscriptionPaymentFormContentProps = {
  plan: BillingPlanKey;
  recurringInterval: SubscriptionInterval;
};

type SubscriptionPaymentFormProps = SubscriptionPaymentFormContentProps & {
  amount: number;
};

const StyledFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  margin-bottom: ${themeCssVariables.spacing[8]};
  width: 100%;
`;

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const SubscriptionPaymentFormContent = ({
  plan,
  recurringInterval,
}: SubscriptionPaymentFormContentProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { enqueueErrorSnackBar } = useSnackBar();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customerEmail = useAtomStateValue(currentUserState)?.email;

  const [createSubscriptionPaymentIntent] = useMutation(
    CreateSubscriptionPaymentIntentDocument,
  );

  const isStripeReady = isDefined(stripe) && isDefined(elements);

  const handleSubmit = async () => {
    if (!isStripeReady) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: submitError } = await elements.submit();
      if (isDefined(submitError)) {
        enqueueErrorSnackBar({
          message:
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
        enqueueErrorSnackBar({
          message: t`Subscription error. Please retry or contact Twenty team`,
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
        enqueueErrorSnackBar({
          message:
            error.message ??
            t`We couldn't confirm your payment method. Please retry.`,
        });
        setIsSubmitting(false);
      }
    } catch {
      enqueueErrorSnackBar({
        message: t`Subscription error. Please retry or contact Twenty team`,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <StyledFormContainer>
      <PaymentElement
        options={{
          defaultValues: isDefined(customerEmail)
            ? { billingDetails: { email: customerEmail } }
            : undefined,
        }}
      />
      <StyledButtonContainer>
        <MainButton
          title={t`Continue`}
          onClick={handleSubmit}
          width={200}
          Icon={() => (isSubmitting ? <Loader /> : null)}
          disabled={!isStripeReady || isSubmitting}
        />
      </StyledButtonContainer>
    </StyledFormContainer>
  );
};

export const SubscriptionPaymentForm = ({
  plan,
  recurringInterval,
  amount,
}: SubscriptionPaymentFormProps) => {
  const stripePromise = useStripePromise();
  const appearance = useStripeAppearance();

  if (!isDefined(stripePromise)) {
    return (
      <StyledFormContainer>
        <Info
          accent="danger"
          text={t`Card payment is currently unavailable. Please verify your Stripe configuration or contact your workspace admin.`}
        />
      </StyledFormContainer>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{ mode: 'subscription', amount, currency: 'usd', appearance }}
    >
      <SubscriptionPaymentFormContent
        plan={plan}
        recurringInterval={recurringInterval}
      />
    </Elements>
  );
};
