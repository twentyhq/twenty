import { t } from '@lingui/core/macro';
import { useMutation } from '@apollo/client';
import { useMemo, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import { H2Title } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';

import { UPDATE_SUBSCRIPTION_ITEM_PRICE } from '@/billing/graphql/mutations/updateSubscriptionItemPrice';
import { findMeteredPriceInCurrentWorkspaceSubscriptions } from '@/billing/utils/findPriceInCurrentWorkspaceSubscriptions';
import { Select } from '@/ui/input/components/Select';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { formatNumber } from '~/utils/format/number';
import {
  type BillingPriceOutput,
  type BillingSubscriptionItem,
  SubscriptionInterval,
} from '~/generated/graphql';
import { findOrThrow } from '~/utils/array/findOrThrow';
import { getIntervalLabel } from '@/billing/utils/subscriptionFlags';

const StyledRow = styled.div`
  align-items: flex-end;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledSelect = styled(Select<string>)`
  flex: 1 1;
`;

const StyledButton = styled(Button)`
  flex: 0 0 auto;
`;

const compareByAmountAsc = (a: BillingPriceOutput, b: BillingPriceOutput) =>
  a.amount - b.amount;

const toOption = (meteredBillingPrice: BillingPriceOutput) => {
  const nickname = meteredBillingPrice.nickname;
  const price = formatNumber(meteredBillingPrice.amount / 100, 2);
  return {
    label: `${nickname} - ${price}$`,
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

  const { openModal } = useModal();
  const [selectedPriceId, setSelectedPriceId] = useState<string | undefined>(
    undefined,
  );

  const selectedPrice = useMemo(
    () =>
      selectedPriceId
        ? meteredBillingPrices.find(
            ({ stripePriceId }) => stripePriceId === selectedPriceId,
          )
        : undefined,
    [selectedPriceId, meteredBillingPrices],
  );

  const isChanged = Boolean(
    selectedPriceId &&
      selectedPriceId !== currentMeteredBillingPrice?.stripePriceId,
  );

  const isUpgrade = useMemo(() => {
    if (!isChanged || !selectedPrice || !currentMeteredBillingPrice)
      return false;
    return selectedPrice.amount > currentMeteredBillingPrice.amount;
  }, [isChanged, selectedPrice, currentMeteredBillingPrice]);

  const handleChange = (priceId: string) => {
    setSelectedPriceId(priceId);
  };

  const confirmModalId = 'metered-price-change-confirmation-modal';

  const handleOpenConfirm = () => {
    if (!isChanged || !selectedPrice) return;
    openModal(confirmModalId);
  };

  const recurringInterval = getIntervalLabel(
    currentMeteredBillingPrice?.recurringInterval ===
      SubscriptionInterval.Month,
  );

  const handleConfirmClick = useCallback(async () => {
    if (!selectedPrice) return;
    try {
      await updateSubscriptionItemPrice({
        variables: { priceId: selectedPrice.stripePriceId },
      });
      enqueueSuccessSnackBar({ message: t`Price updated.` });
      setCurrentMeteredBillingPrice(
        findOrThrow(
          meteredBillingPrices,
          ({ stripePriceId }) => stripePriceId === selectedPrice.stripePriceId,
        ),
      );
      setSelectedPriceId(undefined);
    } catch {
      enqueueErrorSnackBar({ message: t`Failed to update price.` });
    }
  }, [
    selectedPrice,
    updateSubscriptionItemPrice,
    enqueueSuccessSnackBar,
    enqueueErrorSnackBar,
    meteredBillingPrices,
  ]);

  return (
    <>
      <H2Title
        title={t`Credit Plan`}
        description={t`Number of new credits allocated every ${recurringInterval}`}
      />
      <StyledRow>
        <StyledSelect
          dropdownId={'settings-billing-metered-price'}
          options={options}
          value={selectedPriceId ?? currentMeteredBillingPrice.stripePriceId}
          onChange={handleChange}
          disabled={isUpdating || isTrialing}
          description={
            isTrialing ? t`Please start your subscription first` : undefined
          }
          fullWidth
        />
        <StyledButton
          title={isUpgrade || !isChanged ? t`Upgrade` : t`Downgrade`}
          onClick={handleOpenConfirm}
          variant="primary"
          isLoading={isUpdating}
          disabled={!isChanged}
          accent={isUpgrade || !isChanged ? 'blue' : 'danger'}
        />
      </StyledRow>
      <ConfirmationModal
        modalId={confirmModalId}
        title={isUpgrade ? t`Confirm upgrade` : t`Confirm downgrade`}
        subtitle={t`Confirm changing your current credit plan.`}
        confirmButtonText={isUpgrade ? t`Upgrade` : t`Downgrade`}
        confirmButtonAccent={isUpgrade ? 'blue' : 'danger'}
        loading={isUpdating}
        onConfirmClick={handleConfirmClick}
      />
    </>
  );
};
