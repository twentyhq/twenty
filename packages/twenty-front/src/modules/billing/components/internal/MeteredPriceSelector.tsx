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
  type BillingSubscriptionItem,
} from '~/generated/graphql';
import { isDefined } from 'twenty-shared/utils';

export const MeteredPriceSelector = ({
  meteredBillingPrices,
  billingSubscriptionItems,
}: {
  meteredBillingPrices: Array<BillingPriceOutput>;
  billingSubscriptionItems: Array<BillingSubscriptionItem>;
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

  const options = meteredBillingPrices.map((meteredBillingPrice) => {
    return {
      label: t`${meteredBillingPrice.nickname} - ${formatNumber(meteredBillingPrice?.amount / 100, 2)}$`,
      value: meteredBillingPrice.stripePriceId,
    };
  });

  const handleChange = async (priceId: string) => {
    try {
      await updateSubscriptionItemPrice({
        variables: { priceId },
      });
      enqueueSuccessSnackBar({ message: t`Price updated.` });
      setCurrentMeteredBillingPrice(
        meteredBillingPrices.find(
          ({ stripePriceId }) => stripePriceId === priceId,
        ),
      );
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to update price.`,
      });
    }
  };

  return (
    <>
      <H2Title title={t`Credit Plan`} />
      <Select
        label={t`Number of new credits allocated every month`}
        dropdownId={'settings-billing-metered-price'}
        options={options}
        value={currentMeteredBillingPrice?.stripePriceId}
        onChange={handleChange}
        disabled={isUpdating}
      />
    </>
  );
};
