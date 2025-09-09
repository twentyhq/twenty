import { useMutation } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import { H2Title } from 'twenty-ui/display';

import { UPDATE_SUBSCRIPTION_ITEM_PRICE } from '@/billing/graphql/mutations/updateSubscriptionItemPrice';
import { findMeteredPriceInCurrentWorkspaceSubscriptions } from '@/billing/utils/findPriceInCurrentWorkspaceSubscriptions';
import { getIntervalLabel } from '@/billing/utils/subscriptionFlags';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import {
  type BillingPriceOutput,
  type BillingSubscriptionItem,
  SubscriptionInterval,
} from '~/generated/graphql';
import { findOrThrow } from '~/utils/array/findOrThrow';
import { formatNumber } from '~/utils/format/number';

const compareByAmountAsc = (a: BillingPriceOutput, b: BillingPriceOutput) =>
  a.amount - b.amount;

const toOption = (meteredBillingPrice: BillingPriceOutput) => {
  const nickname = meteredBillingPrice.nickname;
  const price = formatNumber(meteredBillingPrice.amount / 100, 2);
  return {
    label: t`${nickname} - ${price}$`,
    value: meteredBillingPrice.stripePriceId,
  };
};

export const MeteredPriceSelector = ({
  meteredBillingPrices,
  billingSubscriptionItems,
  isTrialing = false,
}: {
  meteredBillingPrices: Array<BillingPriceOutput>;
  billingSubscriptionItems: Array<BillingSubscriptionItem>;
  isTrialing?: boolean;
}) => {
  const [currentMeteredBillingPrice, setCurrentMeteredBillingPrice] = useState(
    findMeteredPriceInCurrentWorkspaceSubscriptions(
      billingSubscriptionItems,
      meteredBillingPrices,
    ),
  );

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const [updateSubscriptionItemPrice, { loading: isUpdating }] = useMutation(
    UPDATE_SUBSCRIPTION_ITEM_PRICE,
  );

  const options = useMemo(
    () => [...meteredBillingPrices].sort(compareByAmountAsc).map(toOption),
    [meteredBillingPrices],
  );

  const handleChange = async (priceId: string) => {
    try {
      await updateSubscriptionItemPrice({
        variables: { priceId },
      });
      enqueueSuccessSnackBar({ message: t`Price updated.` });
      setCurrentMeteredBillingPrice(
        findOrThrow(
          meteredBillingPrices,
          ({ stripePriceId }) => stripePriceId === priceId,
        ),
      );
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to update price.`,
      });
    }
  };

  const recurringInterval = getIntervalLabel(
    currentMeteredBillingPrice?.recurringInterval ===
      SubscriptionInterval.Month,
  );

  return (
    <>
      <H2Title
        title={t`Credit Plan`}
        description={t`Number of new credits allocated every ${recurringInterval}`}
      />
      <Select
        dropdownId="settings-billing-metered-price"
        options={options}
        value={currentMeteredBillingPrice?.stripePriceId}
        onChange={handleChange}
        disabled={isUpdating || isTrialing}
        description={
          isTrialing ? t`Please start your subscription first` : undefined
        }
      />
    </>
  );
};
