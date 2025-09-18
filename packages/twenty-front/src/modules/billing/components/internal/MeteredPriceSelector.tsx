import { t } from '@lingui/core/macro';
import { useState } from 'react';
import styled from '@emotion/styled';
import { H2Title } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import { SubscriptionInterval } from '~/generated/graphql';
import { formatNumber } from '~/utils/format/formatNumber';
import { useBillingPlan } from '@/billing/hooks/useBillingPlan';
import {
  type BillingPriceTiers,
  type MeteredBillingPrice,
} from '@/billing/types/billing-price-tiers.type';
import { useBillingWording } from '@/billing/hooks/useBillingWording';
import { useSetMeteredSubscriptionPriceMutation } from '~/generated-metadata/graphql';
import { findOrThrow, isDefined } from 'twenty-shared/utils';
import { useRecoilState } from 'recoil';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';

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

  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );

  const { getIntervalLabel } = useBillingWording();

  const [currentMeteredBillingPrice, setCurrentMeteredBillingPrice] = useState(
    getCurrentMeteredBillingPrice(),
  );

  const toOption = (meteredBillingPrice: MeteredBillingPrice) => {
    const price = formatNumber(meteredBillingPrice.tiers[0].flatAmount / 100);

    return {
      label: `${formatNumber(meteredBillingPrice.tiers[0].upTo, { abbreviate: true, decimals: 2 })} Credits - $${price}`,
      value: meteredBillingPrice.stripePriceId,
    };
  };

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const [setMeteredSubscriptionPrice, { loading: isUpdating }] =
    useSetMeteredSubscriptionPriceMutation();

  const options = [...meteredBillingPrices]
    .sort((a, b) => a.tiers[0].flatAmount - b.tiers[0].flatAmount)
    .map(toOption);

  const { openModal } = useModal();
  const [selectedPriceId, setSelectedPriceId] = useState<string | undefined>(
    undefined,
  );

  const selectedPrice = selectedPriceId
    ? meteredBillingPrices.find(
        ({ stripePriceId }) => stripePriceId === selectedPriceId,
      )
    : undefined;

  const isChanged =
    selectedPriceId &&
    selectedPriceId !== currentMeteredBillingPrice?.stripePriceId;

  const isUpgrade = () => {
    if (!isChanged || !selectedPrice || !currentMeteredBillingPrice)
      return false;
    return (
      (selectedPrice.tiers as BillingPriceTiers)[0].flatAmount >
      (currentMeteredBillingPrice.tiers as BillingPriceTiers)[0].flatAmount
    );
  };

  const handleChange = (priceId: string) => {
    setSelectedPriceId(priceId);
  };

  const confirmModalId = 'METERED_PRICE_CHANGE_CONFIRMATION_MODAL';

  const handleOpenConfirm = () => {
    if (!isChanged || !selectedPrice) return;
    openModal(confirmModalId);
  };

  const recurringInterval = getIntervalLabel(
    currentMeteredBillingPrice?.recurringInterval ===
      SubscriptionInterval.Month,
  );

  const handleConfirmClick = async () => {
    if (!selectedPrice) return;
    try {
      const { data } = await setMeteredSubscriptionPrice({
        variables: { priceId: selectedPrice.stripePriceId },
      });
      if (
        isDefined(
          data?.setMeteredSubscriptionPrice.currentBillingSubscription,
        ) &&
        isDefined(currentWorkspace)
      ) {
        const newCurrentWorkspace = {
          ...currentWorkspace,
          currentBillingSubscription:
            data.setMeteredSubscriptionPrice.currentBillingSubscription,
          billingSubscriptions:
            data?.setMeteredSubscriptionPrice.billingSubscriptions,
        };
        setCurrentWorkspace(newCurrentWorkspace);
      }
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
  };

  return (
    <>
      <H2Title
        title={t`Credit Plan`}
        description={t`Number of new credits allocated every ${recurringInterval}`}
      />
      <StyledRow>
        <StyledSelect
          dropdownId="settings_billing-metered-price"
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
            title={isUpgrade() ? t`Upgrade` : t`Downgrade`}
            onClick={handleOpenConfirm}
            variant="primary"
            isLoading={isUpdating}
            disabled={!isChanged}
            accent={isUpgrade() ? 'blue' : 'danger'}
          />
        )}
      </StyledRow>
      <ConfirmationModal
        modalId={confirmModalId}
        title={isUpgrade() ? t`Confirm upgrade` : t`Confirm downgrade`}
        subtitle={t`Confirm changing your current credit plan.`}
        confirmButtonText={isUpgrade() ? t`Upgrade` : t`Downgrade`}
        confirmButtonAccent={isUpgrade() ? 'blue' : 'danger'}
        loading={isUpdating}
        onConfirmClick={handleConfirmClick}
      />
    </>
  );
};
