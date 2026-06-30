import { currentUserState } from '@/auth/states/currentUserState';
import { START_SUBSCRIPTION_AFTER_PAYMENT_METHOD_QUERY_PARAM } from '@/settings/billing/constants/StartSubscriptionAfterPaymentMethodQueryParam';
import { useStripeAppearance } from '@/settings/billing/hooks/useStripeAppearance';
import { useStripePromise } from '@/settings/billing/hooks/useStripePromise';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
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
import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { Info } from 'twenty-ui/feedback';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { CreateBillingPaymentMethodSetupIntentDocument } from '~/generated-metadata/graphql';

type AddPaymentMethodFormContentProps = {
  finalRedirectPath?: string;
  onPaymentMethodAdded: () => Promise<void>;
};

type AddPaymentMethodFormProps = AddPaymentMethodFormContentProps;

const StyledFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const AddPaymentMethodFormContent = ({
  finalRedirectPath,
  onPaymentMethodAdded,
}: AddPaymentMethodFormContentProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { enqueueErrorSnackBar } = useSnackBar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();

  const customerEmail = useAtomStateValue(currentUserState)?.email;

  const [createBillingPaymentMethodSetupIntent] = useMutation(
    CreateBillingPaymentMethodSetupIntentDocument,
  );

  const isStripeReady = isDefined(stripe) && isDefined(elements);

  const buildReturnUrl = () => {
    const basePath =
      finalRedirectPath ?? `${location.pathname}${location.search}`;
    const returnUrl = new URL(basePath, window.location.origin);

    returnUrl.searchParams.set(
      START_SUBSCRIPTION_AFTER_PAYMENT_METHOD_QUERY_PARAM,
      'true',
    );

    return returnUrl.toString();
  };

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

      const { data } = await createBillingPaymentMethodSetupIntent();

      const clientSecret =
        data?.createBillingPaymentMethodSetupIntent?.clientSecret;
      if (!isDefined(clientSecret)) {
        enqueueErrorSnackBar({
          message: t`Subscription error. Please retry or contact Twenty team`,
        });
        setIsSubmitting(false);
        return;
      }

      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        clientSecret,
        confirmParams: { return_url: buildReturnUrl() },
        redirect: 'if_required',
      });

      if (isDefined(error)) {
        enqueueErrorSnackBar({
          message:
            error.message ??
            t`We couldn't confirm your payment method. Please retry.`,
        });
        setIsSubmitting(false);
        return;
      }

      if (setupIntent?.status === 'succeeded') {
        await onPaymentMethodAdded();
      }
    } catch (error) {
      if (CombinedGraphQLErrors.is(error)) {
        enqueueErrorSnackBar({ apolloError: error });
      } else {
        enqueueErrorSnackBar({
          message: t`Subscription error. Please retry or contact Twenty team`,
        });
      }
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
      <Button
        title={t`Add credit card`}
        onClick={handleSubmit}
        variant="secondary"
        accent="blue"
        fullWidth
        justify="center"
        isLoading={isSubmitting}
        disabled={!isStripeReady || isSubmitting}
      />
    </StyledFormContainer>
  );
};

export const AddPaymentMethodForm = ({
  finalRedirectPath,
  onPaymentMethodAdded,
}: AddPaymentMethodFormProps) => {
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
      options={{ mode: 'setup', currency: 'usd', appearance }}
    >
      <AddPaymentMethodFormContent
        finalRedirectPath={finalRedirectPath}
        onPaymentMethodAdded={onPaymentMethodAdded}
      />
    </Elements>
  );
};
