import { AnimatedFormattedNumber } from '@/settings/billing/components/internal/AnimatedFormattedNumber';
import { SettingsBillingPlanComparisonTableRow } from '@/settings/billing/components/internal/SettingsBillingPlanComparisonTableRow';
import { SETTINGS_BILLING_COMPARED_PLAN_KEYS } from '@/settings/billing/constants/SettingsBillingComparedPlanKeys';
import { SETTINGS_BILLING_PLAN_COMPARISON_ROWS } from '@/settings/billing/constants/SettingsBillingPlanComparisonRows';
import { type SettingsBillingPlanAction } from '@/settings/billing/types/settingsBillingPlanAction.type';
import {
  type SettingsBillingPlanInterval,
  type SettingsBillingPlanPrices,
} from '@/settings/billing/types/settingsBillingPlanComparison.type';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import {
  Button,
  SegmentedControl,
  type SegmentedControlOption,
} from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import {
  BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';

type SettingsBillingPlanComparisonTableProps = {
  billingInterval: SettingsBillingPlanInterval;
  onBillingIntervalChange: (
    billingInterval: SettingsBillingPlanInterval,
  ) => void;
  planActions: Record<BillingPlanKey, SettingsBillingPlanAction>;
  planPrices: SettingsBillingPlanPrices;
};

const STICKY_HEADER_TOP_OFFSET = themeCssVariables.spacing[6];

const StyledContentContainer = styled.div`
  max-width: 694px;
  width: 100%;
`;

const StyledStickyHeaderContainer = styled.div`
  background: ${themeCssVariables.background.primary};
  margin-top: calc(${STICKY_HEADER_TOP_OFFSET} * -1);
  padding-top: ${STICKY_HEADER_TOP_OFFSET};
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 2;
`;

const StyledComparisonTable = styled.div`
  display: grid;
  row-gap: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledComparisonHeaderGrid = styled.div`
  background: ${themeCssVariables.border.color.medium};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  overflow: clip;
  row-gap: 1px;
  width: 100%;
`;

const StyledComparisonBodyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  overflow: clip;
  width: 100%;
`;

const StyledHeaderCell = styled.div`
  align-items: flex-start;
  background: ${themeCssVariables.background.secondary};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[5]};
  justify-content: space-between;
  min-height: 104px;
  min-width: 0;
  overflow: clip;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledHeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  min-width: 0;
  width: 100%;
`;

const StyledPlanTitle = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: 1.4;
  min-height: 20px;
  width: 100%;
`;

const StyledComparisonTitle = styled(StyledPlanTitle)`
  color: ${themeCssVariables.font.color.secondary};
  font-weight: ${themeCssVariables.font.weight.regular};
`;

const StyledPlanSubtitle = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.regular};
  line-height: 1.6;
`;

const StyledPriceLine = styled.div`
  align-items: baseline;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledPrice = styled.span`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: 1.2;
`;

const StyledPriceSuffix = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  line-height: 1.4;
`;

const StyledActionSlot = styled.div`
  min-width: 0;

  > * {
    max-width: 100%;
  }
`;

export const SettingsBillingPlanComparisonTable = ({
  billingInterval,
  onBillingIntervalChange,
  planActions,
  planPrices,
}: SettingsBillingPlanComparisonTableProps) => {
  const { t } = useLingui();
  const { formatNumber } = useNumberFormat();

  const formatAnimatedPrice = (value: number) =>
    formatNumber(Math.max(0, value));

  const billingIntervalOptions = [
    {
      label: t`Annual`,
      value: SubscriptionInterval.Year,
    },
    {
      label: t`Monthly`,
      value: SubscriptionInterval.Month,
    },
  ] satisfies SegmentedControlOption<SettingsBillingPlanInterval>[];

  return (
    <StyledContentContainer>
      <StyledComparisonTable>
        <StyledStickyHeaderContainer>
          <StyledComparisonHeaderGrid>
            <StyledHeaderCell>
              <StyledHeaderText>
                <StyledComparisonTitle>{t`Compare plans`}</StyledComparisonTitle>
                <StyledPlanSubtitle>
                  {billingInterval === SubscriptionInterval.Year
                    ? t`Save 25% when billed yearly`
                    : t`Billed monthly`}
                </StyledPlanSubtitle>
              </StyledHeaderText>
              <SegmentedControl
                ariaLabel={t`Billing period`}
                itemWidth="content"
                onChange={onBillingIntervalChange}
                options={billingIntervalOptions}
                value={billingInterval}
              />
            </StyledHeaderCell>

            {SETTINGS_BILLING_COMPARED_PLAN_KEYS.map((planKey) => {
              const action = planActions[planKey];
              const price = planPrices[planKey][billingInterval];

              return (
                <StyledHeaderCell key={planKey}>
                  <StyledHeaderText>
                    <StyledPlanTitle>
                      {planKey === BillingPlanKey.PRO
                        ? t`Pro plan`
                        : t`Organization`}
                    </StyledPlanTitle>
                    <StyledPriceLine>
                      <StyledPrice>
                        $
                        <AnimatedFormattedNumber
                          value={price}
                          formatValue={formatAnimatedPrice}
                        />
                      </StyledPrice>
                      <StyledPriceSuffix>{t`/user per month`}</StyledPriceSuffix>
                    </StyledPriceLine>
                  </StyledHeaderText>
                  <StyledActionSlot>
                    <Button
                      Icon={action.Icon}
                      title={action.title}
                      variant={action.variant}
                      accent={action.accent ?? 'default'}
                      size="small"
                      disabled={action.disabled}
                      isLoading={action.isLoading}
                      onClick={action.onClick}
                    />
                  </StyledActionSlot>
                </StyledHeaderCell>
              );
            })}
          </StyledComparisonHeaderGrid>
        </StyledStickyHeaderContainer>

        <StyledComparisonBodyGrid>
          {SETTINGS_BILLING_PLAN_COMPARISON_ROWS.map((row, rowIndex) => (
            <SettingsBillingPlanComparisonTableRow
              key={`row-${rowIndex}`}
              hasTopBorder={rowIndex > 0}
              row={row}
            />
          ))}
        </StyledComparisonBodyGrid>
      </StyledComparisonTable>
    </StyledContentContainer>
  );
};
