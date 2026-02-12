import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useEndSubscriptionTrialPeriodMutation } from '~/generated-metadata/graphql';

export const useEndSubscriptionTrialPeriod = () => {
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [endSubscriptionTrialPeriod] = useEndSubscriptionTrialPeriodMutation();
  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );
  const [isLoading, setIsLoading] = useState(false);
  const { redirect } = useRedirect();

  const endTrialPeriod = async () => {
    try {
      setIsLoading(true);

      const { data } = await endSubscriptionTrialPeriod();
      const endTrialPeriodOutput = data?.endSubscriptionTrialPeriod;

      const hasPaymentMethod = endTrialPeriodOutput?.hasPaymentMethod;

      if (isDefined(hasPaymentMethod) && hasPaymentMethod === false) {
        const billingPortalUrl = endTrialPeriodOutput?.billingPortalUrl;

        if (isDefined(billingPortalUrl)) {
          redirect(billingPortalUrl);

          return { success: false };
        }

        enqueueErrorSnackBar({
          message: t`No payment method found. Please update your billing details.`,
        });

        return { success: false };
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

      enqueueSuccessSnackBar({
        message: t`Subscription activated.`,
      });

      return { success: true };
    } catch {
      enqueueErrorSnackBar({
        message: t`Error while ending trial period. Please contact Twenty team.`,
      });
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    endTrialPeriod,
    isLoading,
  };
};
