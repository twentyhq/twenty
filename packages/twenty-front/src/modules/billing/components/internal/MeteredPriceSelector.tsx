import { useMutation } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { useMemo, useState, useCallback } from 'react';
import styled from '@emotion/styled';
import { H2Title } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';

import { SET_METERED_SUBSCRIPTION_PRICE } from '@/billing/graphql/mutations/setMeteredSubscriptionPrice';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import { SubscriptionInterval } from '~/generated/graphql';
import { findOrThrow } from '~/utils/array/findOrThrow';
import { formatNumber } from '~/utils/format/number';
import { useBillingPlan } from '@/billing/hooks/useBillingPlan';
import {
  type BillingPriceTiers,
  type MeteredBillingPrice,
} from '@/billing/types/billing-price-tiers.type';
import { useBillingWording } from '@/billing/hooks/useBillingWording';

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

export const MeteredPriceSelector = ({
  meteredBillingPrices,
  isTrialing = false,
}: {
  meteredBillingPrices: Array<MeteredBillingPrice>;
  isTrialing?: boolean;
}) => {
  const { getCurrentMeteredBillingPrice } = useBillingPlan();

  const { getIntervalLabel } = useBillingWording();

  const [currentMeteredBillingPrice, setCurrentMeteredBillingPrice] = useState(
    getCurrentMeteredBillingPrice(),
  );

  const toOption = (meteredBillingPrice: MeteredBillingPrice) => {
    const price = formatNumber(meteredBillingPrice.tiers[0].flatAmount / 100);

    return {
      label: `${formatNumber(meteredBillingPrice.tiers[0].upTo, { abbreviate: true })} Credits - $${price}`,
      value: meteredBillingPrice.stripePriceId,
    };
  };

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const [setMeteredSubscriptionPrice, { loading: isUpdating }] = useMutation(
    SET_METERED_SUBSCRIPTION_PRICE,
  );

  const options = useMemo(
    () =>
      [...meteredBillingPrices]
        .sort((a, b) => a.tiers[0].flatAmount - b.tiers[0].flatAmount)
        .map(toOption),
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
    return (
      (selectedPrice.tiers as BillingPriceTiers)[0].flatAmount >
      (currentMeteredBillingPrice.tiers as BillingPriceTiers)[0].flatAmount
    );
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
      await setMeteredSubscriptionPrice({
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
    setMeteredSubscriptionPrice,
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
          dropdownId="settings-billing-metered-price"
          options={options}
          value={selectedPriceId ?? currentMeteredBillingPrice.stripePriceId}
          onChange={handleChange}
          disabled={isUpdating || isTrialing}
          description={
            isTrialing ? t`Please start your subscription first` : undefined
          }
          fullWidth
        />
        {isChanged && (
          <StyledButton
            title={isUpgrade ? t`Upgrade` : t`Downgrade`}
            onClick={handleOpenConfirm}
            variant="primary"
            isLoading={isUpdating}
            disabled={!isChanged}
            accent={isUpgrade ? 'blue' : 'danger'}
          />
        )}
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
