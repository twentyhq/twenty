import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useApplyCurrentWorkspaceBillingUpdate } from '@/settings/billing/hooks/useApplyCurrentWorkspaceBillingUpdate';
import { useGetNextResourceCreditPrice } from '@/settings/billing/hooks/useGetNextResourceCreditPrice';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  SetResourceCreditSubscriptionPriceDocument,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';

export const useCreditUpgradeAction = () => {
  const nextPrice = useGetNextResourceCreditPrice();
  const { formatNumber } = useNumberFormat();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar, enqueueInfoSnackBar } =
    useSnackBar();

  const { applyCurrentWorkspaceBillingUpdate } =
    useApplyCurrentWorkspaceBillingUpdate();

  const [setResourceCreditSubscriptionPrice, { loading: isUpgrading }] =
    useMutation(SetResourceCreditSubscriptionPriceDocument);

  const nextResourceCreditsAmount = isDefined(nextPrice)
    ? formatNumber(nextPrice.creditAmount ?? 0, {
        abbreviate: true,
        decimals: 2,
      })
    : null;

  const nextResourceCreditPrice = isDefined(nextPrice)
    ? formatNumber((nextPrice.unitAmount ?? 0) / 100)
    : null;

  const nextTierInterval = isDefined(nextPrice)
    ? nextPrice.recurringInterval === SubscriptionInterval.Month
      ? t`month`
      : t`year`
    : null;

  const upgradeCreditPlan = async () => {
    if (!isDefined(nextPrice)) {
      return;
    }

    try {
      enqueueInfoSnackBar({
        message: t`Upgrading subscription...`,
      });

      const { data } = await setResourceCreditSubscriptionPrice({
        variables: { priceId: nextPrice.stripePriceId },
      });

      applyCurrentWorkspaceBillingUpdate(
        data?.setResourceCreditSubscriptionPrice,
        {
          transformCurrentBillingSubscription: (
            currentBillingSubscription,
          ) => ({
            ...currentBillingSubscription,
            billingSubscriptionItems:
              currentBillingSubscription.billingSubscriptionItems?.map(
                (item) => ({
                  ...item,
                  hasReachedCurrentPeriodCap: false,
                }),
              ),
          }),
        },
      );

      enqueueSuccessSnackBar({ message: t`Credit plan upgraded.` });
    } catch (error) {
      enqueueErrorSnackBar({ message: t`Failed to upgrade credit plan.` });

      if (!CombinedGraphQLErrors.is(error)) {
        throw error;
      }
    }
  };

  return {
    nextPrice,
    nextResourceCreditsAmount,
    nextResourceCreditPrice,
    nextTierInterval,
    upgradeCreditPlan,
    isUpgrading,
  };
};
