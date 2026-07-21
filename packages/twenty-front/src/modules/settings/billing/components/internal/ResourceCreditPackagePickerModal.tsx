import { AnimatedFormattedNumber } from '@/settings/billing/components/internal/AnimatedFormattedNumber';
import { BILLING_MODAL_IDS } from '@/settings/billing/constants/BillingModalIds';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { AnimatePresence, motion } from 'framer-motion';
import { type ChangeEvent, type ElementType, type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  IconCoins,
  IconHistory,
  IconRefreshDot,
  IconSparkles,
} from 'twenty-ui/icon';
import { Button, Slider } from 'twenty-ui/input';
import { Section, SectionAlignment, SectionFontColor } from 'twenty-ui/layout';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';
import { H1Title, H1TitleFontColor } from 'twenty-ui/typography';

const PACKAGE_SUMMARY_ROW_HEIGHT = 24;
const PACKAGE_SUMMARY_ROW_GAP = 4;

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

const PackageSummaryLabelText = ({ label }: { label: string }) => (
  <StyledPackageSummaryLabelText>
    <OverflowingTextWithTooltip text={label} />
  </StyledPackageSummaryLabelText>
);

type ResourceCreditPackagePickerModalProps = {
  currentCreditAmountDisplay: string;
  currentCreditPriceDisplay: string;
  formatAnimatedCreditAmount: (value: number) => string;
  formatAnimatedPriceAmount: (value: number) => string;
  formatAnimatedRolloverLimit: (value: number) => string;
  intervalAdjective: string;
  intervalLabel: string;
  isChanged: boolean;
  isConfirmDisabled: boolean;
  isUpdating: boolean;
  newRolloverLimit: number | undefined;
  newRolloverLimitValue: number;
  onCancel: () => void;
  onConfirm: () => void;
  onSliderChange: (event: ChangeEvent<HTMLInputElement>) => void;
  priceCount: number;
  selectedCreditAmountValue: number;
  selectedPriceAmountValue: number;
  selectedPriceIndex: number;
};

export const ResourceCreditPackagePickerModal = ({
  currentCreditAmountDisplay,
  currentCreditPriceDisplay,
  formatAnimatedCreditAmount,
  formatAnimatedPriceAmount,
  formatAnimatedRolloverLimit,
  intervalAdjective,
  intervalLabel,
  isChanged,
  isConfirmDisabled,
  isUpdating,
  newRolloverLimit,
  newRolloverLimitValue,
  onCancel,
  onConfirm,
  onSliderChange,
  priceCount,
  selectedCreditAmountValue,
  selectedPriceAmountValue,
  selectedPriceIndex,
}: ResourceCreditPackagePickerModalProps) => {
  const theme = useTheme();

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
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
          color={themeCssVariables.font.color.tertiary}
        />
        <PackageSummaryLabelText label={label} />
      </StyledPackageSummaryLabel>
      <StyledPackageSummaryValue>{value}</StyledPackageSummaryValue>
    </StyledPackageSummaryRow>
  );

  return (
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
              <IconCoins
                size={theme.icon.size.md}
                color={themeCssVariables.color.green9}
              />
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
            max={priceCount - 1}
            step={1}
            value={selectedPriceIndex}
            onChange={onSliderChange}
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
                      size={theme.icon.size.md}
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
          onClick={onCancel}
          variant="secondary"
          title={t`Cancel`}
          fullWidth
          justify="center"
        />
        <Button
          onClick={onConfirm}
          variant="primary"
          accent="blue"
          title={t`Confirm`}
          fullWidth
          justify="center"
          disabled={isConfirmDisabled}
        />
      </StyledModalActions>
    </ModalStatefulWrapper>
  );
};
