import { AppPath } from '@/types/AppPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
  SubscriptionInterval,
  useCheckoutSessionMutation,
} from '~/generated/graphql';

export const FreePassCheckout = () => {
  const { enqueueSnackBar } = useSnackBar();
  const [checkoutSession] = useCheckoutSessionMutation();

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
};
