import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { START_SUBSCRIPTION_AFTER_PAYMENT_METHOD_QUERY_PARAM } from '@/settings/billing/constants/StartSubscriptionAfterPaymentMethodQueryParam';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { useLazyQuery, useMutation } from '@apollo/client/react';
import {
  BillingPortalSessionDocument,
  EndSubscriptionTrialPeriodDocument,
} from '~/generated-metadata/graphql';

export const useEndSubscriptionTrialPeriod = () => {
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar, enqueueInfoSnackBar } =
    useSnackBar();
  const [endSubscriptionTrialPeriod] = useMutation(
    EndSubscriptionTrialPeriodDocument,
  );
  const [getBillingPortalSession] = useLazyQuery(BillingPortalSessionDocument);
  const [currentWorkspace, setCurrentWorkspace] = useAtomState(
    currentWorkspaceState,
  );
  const [isLoading, setIsLoading] = useState(false);
  const { redirect } = useRedirect();
  const location = useLocation();

  const redirectToPaymentMethodUpdate = async (
    fallbackUrl: string | null | undefined,
    finalRedirectPath: string,
  ) => {
    const returnUrl = new URL(finalRedirectPath, 'https://placeholder.invalid');
    returnUrl.searchParams.set(
      START_SUBSCRIPTION_AFTER_PAYMENT_METHOD_QUERY_PARAM,
      'true',
    );
    const confirmReturnPath = `${returnUrl.pathname}${returnUrl.search}${returnUrl.hash}`;

    try {
      const { data } = await getBillingPortalSession({
        variables: {
          returnUrlPath: confirmReturnPath,
          forPaymentMethodUpdate: true,
        },
      });

      const portalUrl = data?.billingPortalSession.url ?? fallbackUrl;

      if (isDefined(portalUrl)) {
        redirect(portalUrl);
        return;
      }
    } catch {
      if (isDefined(fallbackUrl)) {
        redirect(fallbackUrl);
        return;
      }
    }

    enqueueErrorSnackBar({
      message: t`No payment method found. Please update your billing details.`,
    });
  };

  const endTrialPeriod = async (options?: {
    finalRedirectPath?: string;
    skipPaymentMethodRedirect?: boolean;
  }): Promise<{ success: boolean; hasPaymentMethod?: boolean }> => {
    try {
      setIsLoading(true);

      if (options?.skipPaymentMethodRedirect === true) {
        enqueueInfoSnackBar({
          message: t`Activating subscription...`,
        });
      }

      const finalRedirectPath =
        options?.finalRedirectPath ?? `${location.pathname}${location.search}`;

      const { data } = await endSubscriptionTrialPeriod();
      const endTrialPeriodOutput = data?.endSubscriptionTrialPeriod;

      const hasPaymentMethod = endTrialPeriodOutput?.hasPaymentMethod;

      if (isDefined(hasPaymentMethod) && hasPaymentMethod === false) {
        if (options?.skipPaymentMethodRedirect !== true) {
          await redirectToPaymentMethodUpdate(
            endTrialPeriodOutput?.billingPortalUrl,
            finalRedirectPath,
          );
        }

        return { success: false, hasPaymentMethod: false };
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
            billingSubscriptionItems:
              currentWorkspace?.currentBillingSubscription?.billingSubscriptionItems?.map(
                (item) => ({
                  ...item,
                  hasReachedCurrentPeriodCap: false,
                }),
              ),
          },
        });
      }

      enqueueSuccessSnackBar({
        message: t`Subscription activated.`,
      });

      return { success: true, hasPaymentMethod: true };
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
