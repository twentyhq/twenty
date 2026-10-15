import { isDefined } from 'twenty-shared/utils';
import { AnimatedFormattedNumber } from '@/settings/billing/components/internal/AnimatedFormattedNumber';
import { SettingsBillingPlanComparisonTableRow } from '@/settings/billing/components/internal/SettingsBillingPlanComparisonTableRow';
import { BILLING_PLAN_LABELS } from '@/settings/billing/constants/BillingPlanLabels';
import { SETTINGS_BILLING_PLAN_COMPARISON_ROWS } from '@/settings/billing/constants/SettingsBillingPlanComparisonRows';
import { type SettingsBillingComparedPlan } from '@/settings/billing/types/SettingsBillingComparedPlan';
import {
  type SettingsBillingPlanInterval,
  type SettingsBillingPlanPrices,
} from '@/settings/billing/types/SettingsBillingPlanComparison';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import {
  SegmentedControl,
  type SegmentedControlOption,
} from 'twenty-ui/components/input';
import { Button } from 'twenty-ui/primitives/input';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme';
import {
  type BillingPlanKey,
  SubscriptionInterval,
} from '~/generated-metadata/graphql';

type SettingsBillingPlanComparisonTableProps = {
  billingInterval: SettingsBillingPlanInterval;
  comparedPlans: SettingsBillingComparedPlan[];
  onBillingIntervalChange: (
    billingInterval: SettingsBillingPlanInterval,
  ) => void;
  planPrices: SettingsBillingPlanPrices;
};

const STICKY_HEADER_TOP_OFFSET = themeCssVariables.spacing[6];

const MOBILE_COMPARISON_GRID_COLUMNS = 'repeat(2, minmax(0, 1fr))';

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

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    margin-top: 0;
    padding-top: 0;
    position: static;
  }
`;

const StyledMobilePlanNamesGrid = styled.div`
  display: none;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    background: ${themeCssVariables.background.primary};
    border-bottom: 1px solid ${themeCssVariables.border.color.medium};
    display: grid;
    grid-template-columns: ${MOBILE_COMPARISON_GRID_COLUMNS};
    position: sticky;
    top: 0;
    z-index: 2;
  }
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

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const StyledComparisonBodyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  overflow: clip;
  width: 100%;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: ${MOBILE_COMPARISON_GRID_COLUMNS};
  }
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

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    gap: ${themeCssVariables.spacing[4]};
    min-height: auto;
  }
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

const StyledMobilePlanName = styled(StyledPlanTitle)`
  display: block;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[2]};
  text-overflow: ellipsis;
  white-space: nowrap;
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

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;

    > * {
      width: 100%;
    }
  }
`;

export const SettingsBillingPlanComparisonTable = ({
  billingInterval,
  comparedPlans,
  onBillingIntervalChange,
  planPrices,
}: SettingsBillingPlanComparisonTableProps) => {
  const { t } = useLingui();
  const { formatNumber } = useNumberFormat();

  const formatAnimatedPrice = (value: number) =>
    formatNumber(Math.max(0, value));

  const getPlanTitle = (planKey: BillingPlanKey) =>
    t(BILLING_PLAN_LABELS[planKey]);

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
                    ? t`Save 25% when billed annually`
                    : t`Billed monthly`}
                </StyledPlanSubtitle>
              </StyledHeaderText>
              <SegmentedControl
                aria-label={t`Billing period`}
                itemWidth="content"
                onValueChange={onBillingIntervalChange}
                options={billingIntervalOptions}
                value={billingInterval}
              />
            </StyledHeaderCell>

            {comparedPlans.map(({ action, planKey }) => {
              const price = planPrices[planKey][billingInterval];

              return (
                <StyledHeaderCell key={planKey}>
                  <StyledHeaderText>
                    <StyledPlanTitle>{getPlanTitle(planKey)}</StyledPlanTitle>
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
                      startIcon={
                        isDefined(action.Icon) ? <action.Icon /> : undefined
                      }
                      size="sm"
                      disabled={action.disabled}
                      loading={action.isLoading}
                      onClick={action.onClick}
                      variant={action.variant}
                      color={action.color}
                    >
                      {action.title}
                    </Button>
                  </StyledActionSlot>
                </StyledHeaderCell>
              );
            })}
          </StyledComparisonHeaderGrid>
        </StyledStickyHeaderContainer>

        <StyledMobilePlanNamesGrid aria-hidden>
          {comparedPlans.map(({ planKey }) => (
            <StyledMobilePlanName key={planKey}>
              {getPlanTitle(planKey)}
            </StyledMobilePlanName>
          ))}
        </StyledMobilePlanNamesGrid>

        <StyledComparisonBodyGrid>
          {SETTINGS_BILLING_PLAN_COMPARISON_ROWS.map((row, rowIndex) => (
            <SettingsBillingPlanComparisonTableRow
              key={`row-${rowIndex}`}
              hasTopBorder={rowIndex > 0}
              planKeys={comparedPlans.map(({ planKey }) => planKey)}
              row={row}
            />
          ))}
        </StyledComparisonBodyGrid>
      </StyledComparisonTable>
    </StyledContentContainer>
  );
};
