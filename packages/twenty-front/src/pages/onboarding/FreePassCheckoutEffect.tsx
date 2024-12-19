import { AppPath } from '@/types/AppPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useEffect } from 'react';
import {
  SubscriptionInterval,
  useCheckoutSessionMutation,
} from '~/generated/graphql';

export const FreePassCheckoutEffect = () => {
  const { enqueueSnackBar } = useSnackBar();
  const [checkoutSession] = useCheckoutSessionMutation();

  useEffect(() => {
    const createCheckoutSession = async () => {
      try {
        const { data } = await checkoutSession({
          variables: {
            recurringInterval: SubscriptionInterval.Month,
            successUrlPath: AppPath.PlanRequiredSuccess,
            requirePaymentMethod: false,
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
  }, [checkoutSession, enqueueSnackBar]);

  return null;
};
