import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import {
  OnboardingPlanStep,
  onboardingPlanStepState,
} from '@/onboarding/states/onboardingPlanStepState';
import { AppPath } from '@/types/AppPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';
import {
  BillingPaymentProviders,
  InterCreateChargeDto,
  useCheckoutSessionMutation,
} from '~/generated/graphql';
import { getAppPath } from '~/utils/navigation/getAppPath';

export type HandleCheckoutSessionFn = (
  interChargeData?: InterCreateChargeDto,
) => Promise<void>;

export const useHandleCheckoutSession = ({
  recurringInterval,
  plan,
  requirePaymentMethod,
  paymentProvider,
}: {
  recurringInterval: SubscriptionInterval;
  plan: BillingPlanKey;
  requirePaymentMethod: boolean;
  paymentProvider?: BillingPaymentProviders;
}) => {
  const { redirect } = useRedirect();

  const { enqueueSnackBar } = useSnackBar();

  const [checkoutSession] = useCheckoutSessionMutation();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [onboardingPlanStep, setOnboardingPlanStep] = useRecoilState(
    onboardingPlanStepState,
  );

  const handleCheckoutSession: HandleCheckoutSessionFn = async (
    interChargeData,
  ) => {
    setIsSubmitting(true);

    if (
      paymentProvider === BillingPaymentProviders.Inter &&
      onboardingPlanStep === OnboardingPlanStep.Init
    ) {
      setOnboardingPlanStep(OnboardingPlanStep.InterChargeData);
      setIsSubmitting(false);
      return;
    }

    const { data } = await checkoutSession({
      variables: {
        recurringInterval,
        successUrlPath: getAppPath(AppPath.PlanRequiredSuccess),
        plan,
        requirePaymentMethod,
        paymentProvider,
        interChargeData,
      },
    });
    setIsSubmitting(false);
    if (!data?.checkoutSession.url) {
      enqueueSnackBar(
        'Checkout session error. Please retry or contact Twenty team',
        {
          variant: SnackBarVariant.Error,
        },
      );
      return;
    }
    redirect(data.checkoutSession.url);
  };
  return { isSubmitting, handleCheckoutSession };
};
