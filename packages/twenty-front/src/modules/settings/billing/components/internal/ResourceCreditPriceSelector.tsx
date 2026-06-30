import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { BILLING_MODAL_IDS } from '@/settings/billing/constants/BillingModalIds';
import { useApplyCurrentWorkspaceBillingUpdate } from '@/settings/billing/hooks/useApplyCurrentWorkspaceBillingUpdate';
import { useBillingWording } from '@/settings/billing/hooks/useBillingWording';
import { useCurrentResourceCredit } from '@/settings/billing/hooks/useCurrentResourceCredit';
import { useGetResourceCreditUsage } from '@/settings/billing/hooks/useGetResourceCreditUsage';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { animated, useSpring } from '@react-spring/web';
import { AnimatePresence, motion } from 'framer-motion';
import {
  type ChangeEvent,
  type ElementType,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  IconArrowUp,
  IconCoins,
  IconHistory,
  IconRefreshDot,
  IconSparkles,
} from 'twenty-ui/icon';
import { Button, Slider } from 'twenty-ui/input';
import { Section, SectionAlignment, SectionFontColor } from 'twenty-ui/layout';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { H1Title, H1TitleFontColor } from 'twenty-ui/typography';
import { themeCssVariables, ThemeContext } from 'twenty-ui/theme-constants';
import {
  SetResourceCreditSubscriptionPriceDocument,
  SubscriptionInterval,
  type BillingPriceLicensed,
} from '~/generated-metadata/graphql';

const PREDEFINED_RESOURCE_CREDIT_PACKAGE_MULTIPLIERS = [2, 4];

const COUNT_UP_ANIMATION_CONFIG = {
  tension: 300,
  friction: 30,
};

const PACKAGE_SUMMARY_ROW_HEIGHT = 24;
const PACKAGE_SUMMARY_ROW_GAP = 4;

const StyledActionContainer = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
`;

const StyledGreenPrimaryButton = styled(Button)`
  &[data-variant='primary'][data-accent='default'][data-position] {
    --tw-button-color: color(display-p3 1 1 1);

    background: ${themeCssVariables.color.green9};
    border-color: ${themeCssVariables.background.transparent.light};
    color: color(display-p3 1 1 1);
  }

  &[data-variant='primary'][data-accent='default'][data-position]:hover {
    background: ${themeCssVariables.color.green10};
  }

  &[data-variant='primary'][data-accent='default'][data-position]:active {
    background: ${themeCssVariables.color.green12};
  }

  &[data-variant='primary'][data-accent='default'][data-position][data-focus] {
    border-color: ${themeCssVariables.color.green9};
    box-shadow: 0 0 0 3px ${themeCssVariables.color.green3};
  }

  &[data-variant='primary'][data-accent='default'][data-position][data-disabled],
  &[data-variant='primary'][data-accent='default'][data-position][data-disabled]:hover,
  &[data-variant='primary'][data-accent='default'][data-position][data-disabled]:active {
    --tw-button-color: ${themeCssVariables.color.green9};

    background: ${themeCssVariables.color.green3};
    border-color: ${themeCssVariables.background.transparent.light};
    box-shadow: none;
    color: ${themeCssVariables.color.green9};
  }
`;

const StyledCenteredTitle = styled.div`
  text-align: center;

  h2 {
    margin-bottom: ${themeCssVariables.spacing[6]};
  }
`;

const StyledSectionContainer = styled.div`
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.4;
  margin-bottom: ${themeCssVariables.spacing[6]};
  text-box-edge: cap alphabetic;
  text-box-trim: trim-both;
`;

const StyledPackageCard = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: 11px;
`;

const StyledPackageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledPackageHeaderRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[4]};
`;

const StyledPackageHeaderTitle = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledPackageCreditAmount = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  white-space: nowrap;
`;

const StyledPackagePrice = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  flex: 1 1 auto;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  text-align: right;
  white-space: nowrap;
`;

const StyledPackageDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledPackageDivider = styled.div`
  background-color: ${themeCssVariables.border.color.medium};
  height: 1px;
  width: 100%;
`;

const StyledPackageSummaryRows = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledPackageSummaryRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[6]};
  margin-bottom: ${themeCssVariables.spacing[1]};
  min-width: 0;

  &:last-child {
    margin-bottom: 0;
  }
`;

const StyledAnimatedPackageSummaryRow = motion.create(StyledPackageSummaryRow);

const StyledPackageSummaryLabel = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex: 0 0 116px;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  min-height: ${themeCssVariables.spacing[6]};
  min-width: 0;
`;

const StyledPackageSummaryLabelText = styled.div`
  flex: 0 0 96px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledPackageSummaryValue = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex: 1 1 auto;
  font-size: ${themeCssVariables.font.size.md};
  min-height: ${themeCssVariables.spacing[6]};
  min-width: 0;
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[1]};
  white-space: nowrap;
`;

const PackageSummaryLabelText = ({ label }: { label: string }) => (
  <StyledPackageSummaryLabelText>
    <OverflowingTextWithTooltip text={label} />
  </StyledPackageSummaryLabelText>
);

const StyledMutedText = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  margin-left: ${themeCssVariables.spacing[1]};
`;

const StyledAmountWithUnit = styled.span`
  align-items: center;
  display: inline-flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledCurrentValueText = styled.span`
  text-decoration-line: none;

  &[data-strikethrough='true'] {
    text-decoration-line: line-through;
  }
`;

const StyledModalActions = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[6]};

  > div {
    flex: 1;
  }
`;

const AnimatedFormattedNumber = ({
  formatValue,
  value,
}: {
  formatValue: (value: number) => string;
  value: number;
}) => {
  const { animatedValue } = useSpring({
    animatedValue: value,
    config: COUNT_UP_ANIMATION_CONFIG,
  });

  return (
    <animated.span style={{ fontVariantNumeric: 'tabular-nums' }}>
      {animatedValue.to(formatValue)}
    </animated.span>
  );
};

export const ResourceCreditPriceSelector = ({
  resourceCreditPrices,
  isTrialing = false,
  shouldRedirectToSubscribe = false,
  shouldRedirectToManageBilling = false,
  shouldRedirectToUpdatePayment = false,
  canEndTrialPeriod = true,
  onSubscribe,
  isSubscribeSubmitting = false,
  onManageBilling,
  isManageBillingDisabled = false,
  onUpdatePayment,
  isUpdatePaymentDisabled = false,
}: {
  resourceCreditPrices: BillingPriceLicensed[];
  isTrialing?: boolean;
  shouldRedirectToSubscribe?: boolean;
  shouldRedirectToManageBilling?: boolean;
  shouldRedirectToUpdatePayment?: boolean;
  canEndTrialPeriod?: boolean;
  onSubscribe: () => void;
  isSubscribeSubmitting?: boolean;
  onManageBilling: () => void;
  isManageBillingDisabled?: boolean;
  onUpdatePayment: () => void;
  isUpdatePaymentDisabled?: boolean;
}) => {
  const { theme } = useContext(ThemeContext);
  const { currentResourceCreditBillingPrice } = useCurrentResourceCredit();
  const { formatNumber } = useNumberFormat();

  const { applyCurrentWorkspaceBillingUpdate } =
    useApplyCurrentWorkspaceBillingUpdate();
  const { refetchResourceCreditUsage } = useGetResourceCreditUsage();

  const { getIntervalLabel } = useBillingWording();

  const currentResourceCreditPrice = currentResourceCreditBillingPrice;

  const [selectedPriceId, setSelectedPriceId] = useState<string | undefined>();

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

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

  const currentPriceAmountCents = currentResourceCreditPrice?.unitAmount ?? 0;

  const defaultResourceCreditPriceForPicker = useMemo(
    () =>
      sortedResourceCreditPrices.find(
        (price) =>
          price.stripePriceId !== currentResourceCreditPrice?.stripePriceId &&
          (price.unitAmount ?? 0) > currentPriceAmountCents,
      ) ??
      sortedResourceCreditPrices.find(
        (price) =>
          price.stripePriceId !== currentResourceCreditPrice?.stripePriceId,
      ) ??
      currentResourceCreditPrice ??
      sortedResourceCreditPrices[0],
    [
      currentPriceAmountCents,
      currentResourceCreditPrice,
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
        price.stripePriceId !== currentResourceCreditPrice?.stripePriceId &&
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
    currentResourceCreditPrice?.stripePriceId,
    sortedResourceCreditPrices,
  ]);

  const isChanged =
    isDefined(selectedPrice) &&
    selectedPrice.stripePriceId !== currentResourceCreditPrice?.stripePriceId;

  const hasAlternativeResourceCreditPrice = sortedResourceCreditPrices.some(
    (price) =>
      price.stripePriceId !== currentResourceCreditPrice?.stripePriceId,
  );

  const isUpgrade = () => {
    if (
      !isChanged ||
      !isDefined(selectedPrice) ||
      !isDefined(currentResourceCreditPrice)
    ) {
      return false;
    }

    return (
      (selectedPrice.creditAmount ?? 0) >
      (currentResourceCreditPrice.creditAmount ?? 0)
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
  const currentCreditAmountDisplay =
    formatCreditAmount(currentResourceCreditPrice) ?? formatNumber(0);
  const currentCreditPriceDisplay =
    formatPriceAmount(currentResourceCreditPrice) ?? formatNumber(0);

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

  const { openModal, closeModal } = useModal();

  const redirectToRequiredBillingAction = () => {
    if (shouldRedirectToUpdatePayment) {
      onUpdatePayment();

      return true;
    }

    if (shouldRedirectToManageBilling) {
      onManageBilling();

      return true;
    }

    if (shouldRedirectToSubscribe) {
      onSubscribe();

      return true;
    }

    return false;
  };

  const openConfirmationForPrice = (price: BillingPriceLicensed) => {
    if (redirectToRequiredBillingAction()) {
      return;
    }

    setSelectedPriceId(price.stripePriceId);
    openModal(BILLING_MODAL_IDS.confirmResourceCreditPriceChange);
  };

  const handleOpenCreditPackagePicker = () => {
    if (redirectToRequiredBillingAction()) {
      return;
    }

    setSelectedPriceId(defaultResourceCreditPriceForPicker?.stripePriceId);
    openModal(BILLING_MODAL_IDS.creditPackagePicker);
  };

  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    const price = sortedResourceCreditPrices[Number(event.target.value)];

    if (isDefined(price)) {
      setSelectedPriceId(price.stripePriceId);
    }
  };

  const handleConfirmPackagePicker = () => {
    if (!isDefined(selectedPrice) || !isChanged) {
      return;
    }

    closeModal(BILLING_MODAL_IDS.creditPackagePicker);
    openModal(BILLING_MODAL_IDS.confirmResourceCreditPriceChange);
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
      enqueueSuccessSnackBar({ message: t`Resource credits updated.` });
      setSelectedPriceId(undefined);
    } catch {
      enqueueErrorSnackBar({ message: t`Failed to update resource credits.` });
    }
  };

  if (sortedResourceCreditPrices.length === 0) {
    return null;
  }

  const renderPackageSummaryRow = ({
    Icon,
    label,
    value,
  }: {
    Icon: ElementType<{ color?: string; size?: number; stroke?: number }>;
    label: string;
    value: ReactNode;
  }) => (
    <StyledPackageSummaryRow>
      <StyledPackageSummaryLabel>
        <Icon
          size={16}
          stroke={theme.icon.stroke.sm}
          color={themeCssVariables.font.color.tertiary}
        />
        <PackageSummaryLabelText label={label} />
      </StyledPackageSummaryLabel>
      <StyledPackageSummaryValue>{value}</StyledPackageSummaryValue>
    </StyledPackageSummaryRow>
  );

  const shouldShowEndTrialPeriodAction = !isTrialing || canEndTrialPeriod;

  return (
    <>
      <StyledActionContainer>
        {!isTrialing &&
          !shouldRedirectToUpdatePayment &&
          !shouldRedirectToManageBilling &&
          fixedResourceCreditPrices.map((price) => {
            const priceDisplay = formatPriceAmount(price) ?? '';

            return (
              <Button
                key={price.stripePriceId}
                Icon={IconArrowUp}
                title={t`Increase to $${priceDisplay}`}
                variant="secondary"
                size="small"
                onClick={() => openConfirmationForPrice(price)}
                disabled={
                  isUpdating ||
                  (shouldRedirectToManageBilling && isManageBillingDisabled) ||
                  (shouldRedirectToSubscribe && isSubscribeSubmitting)
                }
              />
            );
          })}
        {shouldShowEndTrialPeriodAction && (
          <StyledGreenPrimaryButton
            Icon={IconArrowUp}
            title={
              shouldRedirectToUpdatePayment
                ? t`Update payment`
                : shouldRedirectToManageBilling
                  ? t`Manage billing`
                  : shouldRedirectToSubscribe
                    ? t`Subscribe to increase`
                    : t`Increase`
            }
            variant="primary"
            size="small"
            onClick={() =>
              isTrialing
                ? openModal(BILLING_MODAL_IDS.endTrialPeriod)
                : handleOpenCreditPackagePicker()
            }
            disabled={
              isUpdating ||
              (shouldRedirectToUpdatePayment && isUpdatePaymentDisabled) ||
              (shouldRedirectToManageBilling && isManageBillingDisabled) ||
              (shouldRedirectToSubscribe && isSubscribeSubmitting) ||
              (!shouldRedirectToUpdatePayment &&
                !shouldRedirectToManageBilling &&
                !isTrialing &&
                !hasAlternativeResourceCreditPrice)
            }
          />
        )}
      </StyledActionContainer>
      <ModalStatefulWrapper
        modalInstanceId={BILLING_MODAL_IDS.creditPackagePicker}
        isClosable={true}
        size="medium"
        padding="large"
        overlay="dark"
        width="360px"
        dataGloballyPreventClickOutside
        renderInDocumentBody
        smallBorderRadius
        autoHeight
      >
        <StyledCenteredTitle>
          <H1Title
            title={t`Choose ${intervalAdjective} credits`}
            fontColor={H1TitleFontColor.Primary}
          />
        </StyledCenteredTitle>
        <StyledSectionContainer>
          <Section
            alignment={SectionAlignment.Center}
            fontColor={SectionFontColor.Primary}
          >
            {t`Select the credit package to add to your ${intervalAdjective} bill.`}
          </Section>
        </StyledSectionContainer>
        <StyledPackageCard>
          <StyledPackageHeader>
            <StyledPackageHeaderRow>
              <StyledPackageHeaderTitle>
                <IconCoins size={16} color={themeCssVariables.color.green9} />
                <StyledPackageCreditAmount>
                  <AnimatedFormattedNumber
                    value={selectedCreditAmountValue}
                    formatValue={formatAnimatedCreditAmount}
                  />{' '}
                  {t`credits`}
                </StyledPackageCreditAmount>
              </StyledPackageHeaderTitle>
              <StyledPackagePrice>
                $
                <AnimatedFormattedNumber
                  value={selectedPriceAmountValue}
                  formatValue={formatAnimatedPriceAmount}
                />
                /{intervalLabel}
              </StyledPackagePrice>
            </StyledPackageHeaderRow>
            <Slider
              aria-label={t`Credit package`}
              min={0}
              max={sortedResourceCreditPrices.length - 1}
              step={1}
              value={selectedPriceIndex}
              onChange={handleSliderChange}
              disabled={isUpdating}
              color="green"
            />
          </StyledPackageHeader>
          <StyledPackageDetails>
            <StyledPackageDivider />
            <StyledPackageSummaryRows>
              {renderPackageSummaryRow({
                Icon: IconHistory,
                label: t`Current`,
                value: (
                  <>
                    <StyledCurrentValueText
                      data-strikethrough={isChanged || undefined}
                    >
                      {t`${currentCreditAmountDisplay} credits `}
                    </StyledCurrentValueText>
                    <StyledMutedText>
                      <StyledCurrentValueText
                        data-strikethrough={isChanged || undefined}
                      >
                        {t`($${currentCreditPriceDisplay}/${intervalLabel})`}
                      </StyledCurrentValueText>
                    </StyledMutedText>
                  </>
                ),
              })}
              <AnimatePresence initial={false}>
                {isChanged && (
                  <StyledAnimatedPackageSummaryRow
                    key="new-credit-package-summary-row"
                    initial={{
                      height: 0,
                      marginBottom: 0,
                      opacity: 0,
                      y: -2,
                    }}
                    animate={{
                      height: PACKAGE_SUMMARY_ROW_HEIGHT,
                      marginBottom: PACKAGE_SUMMARY_ROW_GAP,
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      height: 0,
                      marginBottom: 0,
                      opacity: 0,
                      y: -2,
                    }}
                    transition={{
                      duration: theme.animation.duration.fast,
                      ease: 'easeInOut',
                    }}
                  >
                    <StyledPackageSummaryLabel>
                      <IconSparkles
                        size={16}
                        stroke={theme.icon.stroke.sm}
                        color={themeCssVariables.font.color.tertiary}
                      />
                      <PackageSummaryLabelText label={t`New credit pack`} />
                    </StyledPackageSummaryLabel>
                    <StyledPackageSummaryValue>
                      <span>
                        $
                        <AnimatedFormattedNumber
                          value={selectedPriceAmountValue}
                          formatValue={formatAnimatedPriceAmount}
                        />
                        {t` per ${intervalLabel}`}
                      </span>
                    </StyledPackageSummaryValue>
                  </StyledAnimatedPackageSummaryRow>
                )}
              </AnimatePresence>
              {isDefined(newRolloverLimit) &&
                renderPackageSummaryRow({
                  Icon: IconRefreshDot,
                  label: t`New rollover limit`,
                  value: (
                    <StyledAmountWithUnit>
                      <AnimatedFormattedNumber
                        value={newRolloverLimitValue}
                        formatValue={formatAnimatedRolloverLimit}
                      />
                      <span>{t`credits`}</span>
                    </StyledAmountWithUnit>
                  ),
                })}
            </StyledPackageSummaryRows>
          </StyledPackageDetails>
        </StyledPackageCard>
        <StyledModalActions>
          <Button
            onClick={() => closeModal(BILLING_MODAL_IDS.creditPackagePicker)}
            variant="secondary"
            title={t`Cancel`}
            fullWidth
            justify="center"
          />
          <Button
            onClick={handleConfirmPackagePicker}
            variant="primary"
            accent="blue"
            title={t`Confirm`}
            fullWidth
            justify="center"
            disabled={!isChanged || isUpdating}
          />
        </StyledModalActions>
      </ModalStatefulWrapper>
      <ConfirmationModal
        modalInstanceId={BILLING_MODAL_IDS.confirmResourceCreditPriceChange}
        title={isUpgrade() ? t`Confirm upgrade` : t`Confirm downgrade`}
        subtitle={
          isDefined(selectedCreditAmountDisplay) &&
          isDefined(selectedPriceDisplay)
            ? t`Confirm changing to ${selectedCreditAmountDisplay} credits for $${selectedPriceDisplay} per ${intervalLabel}.`
            : t`Confirm changing your current resource credit allocation.`
        }
        confirmButtonText={isUpgrade() ? t`Upgrade` : t`Downgrade`}
        confirmButtonAccent={isUpgrade() ? 'blue' : 'danger'}
        loading={isUpdating}
        onConfirmClick={handleConfirmClick}
      />
    </>
  );
};
