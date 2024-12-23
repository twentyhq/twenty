import { useBillingPlan } from '@/billing/hooks/useBillingPlan';
import { AppPath } from '@/types/AppPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Navigate } from 'react-router-dom';
import {
  SubscriptionInterval,
  useCheckoutSessionMutation,
} from '~/generated/graphql';

export const PlanCheckoutEffect = () => {
  const { enqueueSnackBar } = useSnackBar();
  const [checkoutSession] = useCheckoutSessionMutation();
  const plan = useBillingPlan();

  // if plan isn't defined then redirect to the plan required page
  if (!plan) {
    return <Navigate to={AppPath.PlanRequired} />;
  }

  const createCheckoutSession = async () => {
    try {
      const { data } = await checkoutSession({
        variables: {
          recurringInterval: SubscriptionInterval.Month,
          successUrlPath: AppPath.PlanRequiredSuccess,
          plan: plan,
        },
      });

      if (!data?.checkoutSession.url) {
        enqueueSnackBar(
          'Checkout session error. Please retry or contact Twenty team',
          {
            variant: SnackBarVariant.Error,
          },
        );
        return;
      }

      window.location.replace(data.checkoutSession.url);
    } catch (error) {
      enqueueSnackBar('Error creating checkout session', {
        variant: SnackBarVariant.Error,
      });
    }
  };

  createCheckoutSession();

  return <></>;
};
