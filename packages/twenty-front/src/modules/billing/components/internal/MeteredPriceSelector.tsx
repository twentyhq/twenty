import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useBillingWording } from '@/billing/hooks/useBillingWording';
import { useCurrentMetered } from '@/billing/hooks/useCurrentMetered';
import { useGetWorkflowNodeExecutionUsage } from '@/billing/hooks/useGetWorkflowNodeExecutionUsage';
import {
  type BillingPriceTiers,
  type MeteredBillingPrice,
} from '@/billing/types/billing-price-tiers.type';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { findOrThrow, isDefined } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { useSetMeteredSubscriptionPriceMutation } from '~/generated-metadata/graphql';
import { SubscriptionInterval } from '~/generated/graphql';

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
  const { currentMeteredBillingPrice } = useCurrentMetered();
  const { formatNumber } = useNumberFormat();

  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );

  const { refetchMeteredProductsUsage } = useGetWorkflowNodeExecutionUsage();

  const { getIntervalLabel } = useBillingWording();

  const [currentMeteredPrice, setCurrentMeteredPrice] = useState(
    currentMeteredBillingPrice,
  );

  const toOption = (meteredBillingPrice: MeteredBillingPrice) => {
    const price = formatNumber(meteredBillingPrice.tiers[0].flatAmount / 100);
    const credits = formatNumber(meteredBillingPrice.tiers[0].upTo, {
      abbreviate: true,
      decimals: 2,
    });

    return {
      label: t`${credits} Credits - $${price}`,
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

  const selectedPrice = meteredBillingPrices.find(
    ({ stripePriceId }) => stripePriceId === selectedPriceId,
  );

  const isChanged =
    selectedPriceId && selectedPriceId !== currentMeteredPrice?.stripePriceId;

  const isUpgrade = () => {
    if (!isChanged || !selectedPrice || !currentMeteredPrice) return false;
    return (
      (selectedPrice.tiers as BillingPriceTiers)[0].flatAmount >
      (currentMeteredPrice.tiers as BillingPriceTiers)[0].flatAmount
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
    currentMeteredPrice?.recurringInterval === SubscriptionInterval.Month,
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
        refetchMeteredProductsUsage();
      }
      enqueueSuccessSnackBar({ message: t`Price updated.` });
      setCurrentMeteredPrice(
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
          value={selectedPriceId ?? currentMeteredPrice.stripePriceId}
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
