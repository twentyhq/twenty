import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useEndSubscriptionTrialPeriodMutation } from '~/generated-metadata/graphql';

export const useEndSubscriptionTrialPeriod = () => {
  const { enqueueSnackBar } = useSnackBar();
  const [endSubscriptionTrialPeriod] = useEndSubscriptionTrialPeriodMutation();
  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );
  const [isLoading, setIsLoading] = useState(false);

  const endTrialPeriod = async () => {
    try {
      setIsLoading(true);

      const { data } = await endSubscriptionTrialPeriod();
      const endTrialPeriodOutput = data?.endSubscriptionTrialPeriod;

      const hasPaymentMethod = endTrialPeriodOutput?.hasPaymentMethod;

      if (isDefined(hasPaymentMethod) && hasPaymentMethod === false) {
        enqueueSnackBar(
          t`No payment method found. Please update your billing details.`,
          {
            variant: SnackBarVariant.Error,
          },
        );

        return;
      }

      const updatedSubscriptionStatus = endTrialPeriodOutput?.status;
      if (
        isDefined(updatedSubscriptionStatus) &&
        isDefined(currentWorkspace?.currentBillingSubscription)
      ) {
        setCurrentWorkspace({
          ...currentWorkspace,
          currentBillingSubscription: {
            ...currentWorkspace?.currentBillingSubscription,
            status: updatedSubscriptionStatus,
          },
        });
      }

      enqueueSnackBar(t`Subscription activated.`, {
        variant: SnackBarVariant.Success,
      });
    } catch {
      enqueueSnackBar(
        t`Error while ending trial period. Please contact Twenty team.`,
        {
          variant: SnackBarVariant.Error,
        },
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    endTrialPeriod,
    isLoading,
  };
};
