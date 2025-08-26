import { t } from '@lingui/core/macro';
import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { H2Title } from 'twenty-ui/display';

import { UPDATE_SUBSCRIPTION_ITEM_PRICE } from '@/billing/graphql/mutations/updateSubscriptionItemPrice';
import { findMeteredPriceInCurrentWorkspaceSubscriptions } from '@/billing/utils/findPriceInCurrentWorkspaceSubscriptions';
import { Select } from '@/ui/input/components/Select';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { formatNumber } from '~/utils/format/number';
import {
  type BillingPriceOutput,
  BillingProductKey,
  type BillingSubscriptionItem,
} from '~/generated/graphql';

export const MeteredPriceSelector = ({
  meteredBillingPrices,
  billingSubscriptionItems,
}: {
  meteredBillingPrices: Array<BillingPriceOutput>;
  billingSubscriptionItems: Array<BillingSubscriptionItem>;
}) => {
  const [currentMeteredStripeId, setCurrentMeteredStripeId] = useState(
    findMeteredPriceInCurrentWorkspaceSubscriptions(
      billingSubscriptionItems,
      meteredBillingPrices,
    ),
  );

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const [updateSubscriptionItemPrice, { loading: isUpdating }] = useMutation(
    UPDATE_SUBSCRIPTION_ITEM_PRICE,
  );

  const options = meteredBillingPrices.map((elm) => {
    return {
      label: t`${elm.nickname} - ${formatNumber(elm?.amount / 100, 2)}$`,
      value: elm.stripePriceId,
    };
  });

  const handleChange = async (priceId: string) => {
    try {
      await updateSubscriptionItemPrice({
        variables: { priceId },
      });
      enqueueSuccessSnackBar({ message: t`Price updated.` });
      setCurrentMeteredStripeId(
        meteredBillingPrices.find((elm) => elm.stripePriceId === priceId),
      );
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to update price.`,
      });
    }
  };

  return (
    <>
      <H2Title
        title={t`Current Monthly Credits Available`}
        description={t`Number of credits available each month.`}
      />
      <Select
        dropdownId={'settings-billing-metered-price'}
        options={options}
        value={currentMeteredStripeId?.stripePriceId}
        onChange={handleChange}
        disabled={isUpdating}
      />
    </>
  );
};
