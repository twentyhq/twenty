import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { ResourceCreditPackagePickerModal } from '@/settings/billing/components/internal/ResourceCreditPackagePickerModal';
import { BILLING_MODAL_IDS } from '@/settings/billing/constants/BillingModalIds';
import { useApplyCurrentWorkspaceBillingUpdate } from '@/settings/billing/hooks/useApplyCurrentWorkspaceBillingUpdate';
import { useBillingWording } from '@/settings/billing/hooks/useBillingWording';
import { useCurrentResourceCredit } from '@/settings/billing/hooks/useCurrentResourceCredit';
import { useGetResourceCreditUsage } from '@/settings/billing/hooks/useGetResourceCreditUsage';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';
import {
  IconAdjustments,
  IconArrowUp,
  IconCircleX,
  IconCreditCard,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  SetResourceCreditSubscriptionPriceDocument,
  SubscriptionInterval,
  type BillingPriceLicensed,
} from '~/generated-metadata/graphql';

const PREDEFINED_RESOURCE_CREDIT_PACKAGE_MULTIPLIERS = [2, 4];

const StyledActionContainer = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
`;

export const ResourceCreditPriceSelector = ({
  resourceCreditPrices,
  isTrialing = false,
  shouldRedirectToManageBilling = false,
  shouldRedirectToUpdatePayment = false,
  canEndTrialPeriod = true,
  onManageBilling,
  isManageBillingDisabled = false,
  onUpdatePayment,
  isUpdatePaymentDisabled = false,
  canCancelCreditPackSwitch = false,
  onCancelCreditPackSwitch,
}: {
  resourceCreditPrices: BillingPriceLicensed[];
  isTrialing?: boolean;
  shouldRedirectToManageBilling?: boolean;
  shouldRedirectToUpdatePayment?: boolean;
  canEndTrialPeriod?: boolean;
  onManageBilling: () => void;
  isManageBillingDisabled?: boolean;
  onUpdatePayment: () => void;
  isUpdatePaymentDisabled?: boolean;
  canCancelCreditPackSwitch?: boolean;
  onCancelCreditPackSwitch?: () => void;
}) => {
  const {
    currentResourceCreditBillingPrice,
    currentResourceCreditSubscriptionItem,
    currentResourceCreditUnitAmount,
    currentResourceCreditAmount,
  } = useCurrentResourceCredit();
  const { formatNumber } = useNumberFormat();

  const { applyCurrentWorkspaceBillingUpdate } =
    useApplyCurrentWorkspaceBillingUpdate();
  const { refetchResourceCreditUsage } = useGetResourceCreditUsage();

  const { getIntervalLabel } = useBillingWording();

  const currentResourceCreditPrice = currentResourceCreditBillingPrice;

  // The catalog price is gone once the workspace's package is archived, so
  // identity and the amount it pays both come from the subscription first.
  const currentResourceCreditStripePriceId =
    currentResourceCreditSubscriptionItem?.stripePriceId ??
    currentResourceCreditPrice?.stripePriceId;

  const [selectedPriceId, setSelectedPriceId] = useState<string | undefined>();

  const { enqueueToast } = useToast();

  const [setResourceCreditPrice, { loading: isUpdating }] = useMutation(
    SetResourceCreditSubscriptionPriceDocument,
  );

  const sortedResourceCreditPrices = useMemo(
    () =>
      [...resourceCreditPrices].sort(
        (a, b) => (a.unitAmount ?? 0) - (b.unitAmount ?? 0),
      ),
    [resourceCreditPrices],
  );

  const currentPriceAmountCents = currentResourceCreditUnitAmount ?? 0;

  const defaultResourceCreditPriceForPicker = useMemo(
    () =>
      sortedResourceCreditPrices.find(
        (price) =>
          price.stripePriceId !== currentResourceCreditStripePriceId &&
          (price.unitAmount ?? 0) > currentPriceAmountCents,
      ) ??
      sortedResourceCreditPrices.find(
        (price) => price.stripePriceId !== currentResourceCreditStripePriceId,
      ) ??
      currentResourceCreditPrice ??
      sortedResourceCreditPrices[0],
    [
      currentPriceAmountCents,
      currentResourceCreditPrice,
      currentResourceCreditStripePriceId,
      sortedResourceCreditPrices,
    ],
  );

  const selectedPrice =
    sortedResourceCreditPrices.find(
      ({ stripePriceId }) => stripePriceId === selectedPriceId,
    ) ??
    currentResourceCreditPrice ??
    sortedResourceCreditPrices[0];

  const selectedPriceIndex = Math.max(
    0,
    sortedResourceCreditPrices.findIndex(
      ({ stripePriceId }) => stripePriceId === selectedPrice?.stripePriceId,
    ),
  );

  const fixedResourceCreditPrices = useMemo(() => {
    const higherResourceCreditPrices = sortedResourceCreditPrices.filter(
      (price) =>
        price.stripePriceId !== currentResourceCreditStripePriceId &&
        (price.unitAmount ?? 0) > currentPriceAmountCents,
    );

    if (currentPriceAmountCents <= 0) {
      return higherResourceCreditPrices.slice(
        0,
        PREDEFINED_RESOURCE_CREDIT_PACKAGE_MULTIPLIERS.length,
      );
    }

    const selectedStripePriceIds = new Set<string>();

    return PREDEFINED_RESOURCE_CREDIT_PACKAGE_MULTIPLIERS.map((multiplier) => {
      const targetUnitAmount = currentPriceAmountCents * multiplier;
      const nextMatchingPrice = higherResourceCreditPrices.find(
        (price) =>
          !selectedStripePriceIds.has(price.stripePriceId) &&
          (price.unitAmount ?? 0) >= targetUnitAmount,
      );

      if (isDefined(nextMatchingPrice)) {
        selectedStripePriceIds.add(nextMatchingPrice.stripePriceId);
      }

      return nextMatchingPrice;
    }).filter((price): price is BillingPriceLicensed => isDefined(price));
  }, [
    currentPriceAmountCents,
    currentResourceCreditStripePriceId,
    sortedResourceCreditPrices,
  ]);

  const isChanged =
    isDefined(selectedPrice) &&
    selectedPrice.stripePriceId !== currentResourceCreditStripePriceId;

  const hasAlternativeResourceCreditPrice = sortedResourceCreditPrices.some(
    (price) => price.stripePriceId !== currentResourceCreditStripePriceId,
  );

  // Compared against the subscription's own package: the catalog price is gone
  // once it is archived, which would otherwise confirm every change as a
  // downgrade.
  const isUpgrade = () => {
    if (!isChanged || !isDefined(selectedPrice)) {
      return false;
    }

    return (
      (selectedPrice.creditAmount ?? 0) > (currentResourceCreditAmount ?? 0)
    );
  };

  const isMonthly =
    selectedPrice?.recurringInterval === SubscriptionInterval.Month;
  const intervalAdjective = getIntervalLabel(isMonthly, true);
  const intervalLabel = getIntervalLabel(isMonthly);

  const formatPriceAmount = (price: BillingPriceLicensed | undefined) =>
    isDefined(price) ? formatNumber((price.unitAmount ?? 0) / 100) : undefined;

  const formatCreditAmount = (price: BillingPriceLicensed | undefined) =>
    isDefined(price)
      ? formatNumber(price.creditAmount ?? 0, {
          abbreviate: true,
          decimals: 2,
        })
      : undefined;

  const selectedPriceDisplay = formatPriceAmount(selectedPrice);
  const selectedCreditAmountDisplay = formatCreditAmount(selectedPrice);
  const currentCreditAmountDisplay = formatNumber(
    currentResourceCreditAmount ?? 0,
    { abbreviate: true, decimals: 2 },
  );
  const currentCreditPriceDisplay = formatNumber(
    (currentResourceCreditUnitAmount ?? 0) / 100,
  );

  const selectedCreditUnitAmount = selectedPrice?.unitAmount;
  const selectedCreditAmount = selectedPrice?.creditAmount;
  const selectedCreditAmountValue = selectedCreditAmount ?? 0;
  const selectedPriceAmountValue = isDefined(selectedCreditUnitAmount)
    ? selectedCreditUnitAmount / 100
    : 0;

  const newRolloverLimit = isDefined(selectedCreditAmount)
    ? selectedCreditAmount * 2
    : undefined;

  const newRolloverLimitValue = newRolloverLimit ?? 0;

  const formatAnimatedCreditAmount = (value: number) =>
    formatNumber(Math.max(0, Math.round(value)), {
      abbreviate: true,
      decimals: 2,
    });

  const formatAnimatedPriceAmount = (value: number) =>
    formatNumber(Math.max(0, value));

  const formatAnimatedRolloverLimit = (value: number) =>
    formatNumber(Math.max(0, Math.round(value)), { decimals: 2 });

  const { openDialog, closeDialog } = useDialog();

  const redirectToRequiredBillingAction = () => {
    if (shouldRedirectToUpdatePayment) {
      onUpdatePayment();

      return true;
    }

    if (shouldRedirectToManageBilling) {
      onManageBilling();

      return true;
    }

    return false;
  };

  const openConfirmationForPrice = (price: BillingPriceLicensed) => {
    if (redirectToRequiredBillingAction()) {
      return;
    }

    setSelectedPriceId(price.stripePriceId);
    openDialog(BILLING_MODAL_IDS.confirmResourceCreditPriceChange);
  };

  const handleOpenCreditPackagePicker = () => {
    if (redirectToRequiredBillingAction()) {
      return;
    }

    setSelectedPriceId(defaultResourceCreditPriceForPicker?.stripePriceId);
    openDialog(BILLING_MODAL_IDS.creditPackagePicker);
  };

  const handleSliderValueChange = (value: number) => {
    const price = sortedResourceCreditPrices[value];

    if (isDefined(price)) {
      setSelectedPriceId(price.stripePriceId);
    }
  };

  const handleConfirmPackagePicker = () => {
    if (!isDefined(selectedPrice) || !isChanged) {
      return;
    }

    closeDialog(BILLING_MODAL_IDS.creditPackagePicker);
    openDialog(BILLING_MODAL_IDS.confirmResourceCreditPriceChange);
  };

  const handleConfirmClick = async () => {
    try {
      const { data } = await setResourceCreditPrice({
        variables: { priceId: selectedPrice.stripePriceId },
      });
      applyCurrentWorkspaceBillingUpdate(
        data?.setResourceCreditSubscriptionPrice,
        {
          onBillingUpdateApplied: refetchResourceCreditUsage,
        },
      );
      enqueueToast({
        variant: 'success',
        children: t`Resource credits updated.`,
      });
      setSelectedPriceId(undefined);
    } catch (error) {
      enqueueToast({
        variant: 'error',
        children: t`Failed to update resource credits.`,
      });

      if (!CombinedGraphQLErrors.is(error)) {
        throw error;
      }
    }
  };

  if (sortedResourceCreditPrices.length === 0) {
    return null;
  }

  const shouldShowPrimaryAction =
    shouldRedirectToUpdatePayment ||
    shouldRedirectToManageBilling ||
    !isTrialing ||
    canEndTrialPeriod;
  const PrimaryActionIcon =
    shouldRedirectToUpdatePayment || shouldRedirectToManageBilling
      ? IconCreditCard
      : IconAdjustments;
  const handlePrimaryActionClick = () => {
    if (redirectToRequiredBillingAction()) {
      return;
    }

    if (isTrialing) {
      openDialog(BILLING_MODAL_IDS.endTrialPeriod);
      return;
    }

    handleOpenCreditPackagePicker();
  };

  return (
    <>
      <StyledActionContainer>
        {canCancelCreditPackSwitch && (
          <Button
            startIcon={<IconCircleX />}
            size="sm"
            onClick={onCancelCreditPackSwitch}
            disabled={isUpdating}
            variant="outline"
          >{t`Cancel credit pack switching`}</Button>
        )}
        {!isTrialing &&
          !canCancelCreditPackSwitch &&
          !shouldRedirectToUpdatePayment &&
          !shouldRedirectToManageBilling &&
          fixedResourceCreditPrices.map((price) => {
            const priceDisplay = formatPriceAmount(price) ?? '';

            return (
              <Button
                key={price.stripePriceId}
                startIcon={<IconArrowUp />}
                size="sm"
                onClick={() => openConfirmationForPrice(price)}
                disabled={
                  isUpdating ||
                  (shouldRedirectToManageBilling && isManageBillingDisabled)
                }
                variant="outline"
              >{t`Increase to $${priceDisplay}`}</Button>
            );
          })}
        {shouldShowPrimaryAction && (
          <Button
            startIcon={
              isDefined(PrimaryActionIcon) ? <PrimaryActionIcon /> : undefined
            }
            size="sm"
            onClick={handlePrimaryActionClick}
            disabled={
              isUpdating ||
              (shouldRedirectToUpdatePayment && isUpdatePaymentDisabled) ||
              (shouldRedirectToManageBilling && isManageBillingDisabled) ||
              (!shouldRedirectToUpdatePayment &&
                !shouldRedirectToManageBilling &&
                !isTrialing &&
                !hasAlternativeResourceCreditPrice)
            }
            variant="solid"
            color="success"
          >
            {shouldRedirectToUpdatePayment
              ? t`Update payment`
              : shouldRedirectToManageBilling
                ? t`Manage billing`
                : t`Manage`}
          </Button>
        )}
      </StyledActionContainer>
      <ResourceCreditPackagePickerModal
        currentCreditAmountDisplay={currentCreditAmountDisplay}
        currentCreditPriceDisplay={currentCreditPriceDisplay}
        formatAnimatedCreditAmount={formatAnimatedCreditAmount}
        formatAnimatedPriceAmount={formatAnimatedPriceAmount}
        formatAnimatedRolloverLimit={formatAnimatedRolloverLimit}
        intervalAdjective={intervalAdjective}
        intervalLabel={intervalLabel}
        isChanged={isChanged}
        isConfirmDisabled={!isChanged || isUpdating}
        isUpdating={isUpdating}
        newRolloverLimit={newRolloverLimit}
        newRolloverLimitValue={newRolloverLimitValue}
        onCancel={() => closeDialog(BILLING_MODAL_IDS.creditPackagePicker)}
        onConfirm={handleConfirmPackagePicker}
        onSliderValueChange={handleSliderValueChange}
        priceCount={sortedResourceCreditPrices.length}
        selectedCreditAmountValue={selectedCreditAmountValue}
        selectedPriceAmountValue={selectedPriceAmountValue}
        selectedPriceIndex={selectedPriceIndex}
      />
      <ConfirmationDialog
        dialogId={BILLING_MODAL_IDS.confirmResourceCreditPriceChange}
        title={isUpgrade() ? t`Confirm upgrade` : t`Confirm downgrade`}
        subtitle={
          isDefined(selectedCreditAmountDisplay) &&
          isDefined(selectedPriceDisplay)
            ? t`Confirm changing to ${selectedCreditAmountDisplay} credits for $${selectedPriceDisplay} per ${intervalLabel}.`
            : t`Confirm changing your current resource credit allocation.`
        }
        confirmButtonText={isUpgrade() ? t`Upgrade` : t`Downgrade`}
        confirmButtonColor={isUpgrade() ? 'accent' : 'danger'}
        loading={isUpdating}
        onConfirmClick={handleConfirmClick}
      />
    </>
  );
};
