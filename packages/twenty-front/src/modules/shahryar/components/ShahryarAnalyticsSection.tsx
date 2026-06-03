import { styled } from '@linaria/react';
import { Fragment } from 'react';
import { IconChartBar } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SHAHRYAR_COLORS } from '@/shahryar/constants/shahryar-colors';
import { type ShahryarReportApiAnalytics } from '@/shahryar/types/shahryarReportApi';

type ShahryarAnalyticsSectionProps = {
  analytics?: ShahryarReportApiAnalytics;
};

type GrowthTone = 'negative' | 'neutral' | 'positive';

const StyledSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledSectionHeader = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledSectionTitle = styled.h2`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledAnalyticsGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
`;

const StyledPanel = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  min-width: 0;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledPanelTitle = styled.h3`
  color: ${SHAHRYAR_COLORS.navy};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledRankRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledRankRow = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledRankLabelRow = styled.div`
  align-items: baseline;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  min-width: 0;
`;

const StyledRankLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledRankValue = styled.strong`
  color: ${SHAHRYAR_COLORS.blue};
  font-size: ${themeCssVariables.font.size.sm};
  white-space: nowrap;
`;

const StyledBarTrack = styled.div`
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.xs};
  height: 8px;
  overflow: hidden;
`;

const StyledBarFill = styled.div`
  background: ${themeCssVariables.color.blue7};
  border-radius: ${themeCssVariables.border.radius.xs};
  height: 100%;
`;

const StyledSecondaryText = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledDistrictGrid = styled.div`
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: grid;
  grid-template-columns: minmax(96px, 1fr) repeat(4, minmax(56px, 0.7fr));
  overflow: hidden;
`;

const StyledDistrictCell = styled.div<{ isHeader?: boolean }>`
  background: ${({ isHeader }) =>
    isHeader ? themeCssVariables.background.secondary : 'transparent'};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${({ isHeader }) =>
    isHeader
      ? themeCssVariables.font.color.secondary
      : themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.35;
  min-width: 0;
  overflow-wrap: anywhere;
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledTrendChart = styled.div`
  align-items: end;
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: repeat(6, minmax(32px, 1fr));
  min-height: 180px;
`;

const StyledTrendPoint = styled.div`
  align-items: center;
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-rows: 1fr auto;
  height: 100%;
  min-width: 0;
`;

const StyledTrendBars = styled.div`
  align-items: end;
  display: flex;
  gap: 4px;
  height: 132px;
  justify-content: center;
`;

const StyledTrendBar = styled.div<{ kind: 'payment' | 'sales' }>`
  background: ${({ kind }) =>
    kind === 'sales'
      ? themeCssVariables.color.green7
      : themeCssVariables.color.yellow7};
  border-radius: ${themeCssVariables.border.radius.xs}
    ${themeCssVariables.border.radius.xs} 0 0;
  min-height: 0;
  width: 12px;
`;

const StyledTrendLabel = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledLegendItem = styled.span<{ kind: 'payment' | 'sales' }>`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[1]};

  &::before {
    background: ${({ kind }) =>
      kind === 'sales'
        ? themeCssVariables.color.green7
        : themeCssVariables.color.yellow7};
    border-radius: 50%;
    content: '';
    height: 8px;
    width: 8px;
  }
`;

const StyledGrowthGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
`;

const StyledGrowthItem = styled.div`
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledGrowthValue = styled.strong<{ tone: GrowthTone }>`
  color: ${({ tone }) =>
    tone === 'positive'
      ? themeCssVariables.color.green8
      : tone === 'negative'
        ? themeCssVariables.color.red8
        : themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xl};
`;

const StyledEmptyText = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const formatNumber = (value: number): string => value.toLocaleString('en-US');

const formatGrowth = (percent: number): string =>
  `${percent > 0 ? '+' : ''}${percent}%`;

const getGrowthTone = (percent: number): GrowthTone => {
  if (percent > 0) {
    return 'positive';
  }

  if (percent < 0) {
    return 'negative';
  }

  return 'neutral';
};

const toBarPercent = ({
  maxValue,
  value,
}: {
  maxValue: number;
  value: number;
}) => {
  if (maxValue <= 0 || value <= 0) {
    return 0;
  }

  return Math.max(8, Math.round((value / maxValue) * 100));
};

const toBarWidth = ({
  maxValue,
  value,
}: {
  maxValue: number;
  value: number;
}): string => `${toBarPercent({ maxValue, value })}%`;

const toBarHeight = ({
  maxValue,
  value,
}: {
  maxValue: number;
  value: number;
}): string => `${toBarPercent({ maxValue, value })}%`;

const getMaxValue = (values: number[]): number => Math.max(0, ...values);

export const ShahryarAnalyticsSection = ({
  analytics,
}: ShahryarAnalyticsSectionProps) => {
  if (analytics === undefined) {
    return null;
  }

  const bestMarketMaxValue = getMaxValue(
    analytics.bestMarkets.map((market) => market.value),
  );
  const supervisorMaxValue = getMaxValue(
    analytics.mostActiveSupervisors.map((supervisor) => supervisor.value),
  );
  const trendSalesMaxValue = getMaxValue(
    analytics.salesPaymentTrend.map((point) => point.salesCartons),
  );
  const trendPaymentMaxValue = getMaxValue(
    analytics.salesPaymentTrend.map((point) => point.paidAmount),
  );
  const growth = analytics.monthlyGrowth;

  return (
    <StyledSection>
      <StyledSectionHeader>
        <StyledSectionTitle>شیکاری ڕاپۆرت</StyledSectionTitle>
        <IconChartBar size={18} />
      </StyledSectionHeader>
      <StyledAnalyticsGrid>
        <StyledPanel>
          <StyledPanelTitle>باشترین مارکێتەکان</StyledPanelTitle>
          <StyledRankRows>
            {analytics.bestMarkets.length === 0 ? (
              <StyledEmptyText>-</StyledEmptyText>
            ) : (
              analytics.bestMarkets.map((market) => (
                <StyledRankRow key={market.id}>
                  <StyledRankLabelRow>
                    <StyledRankLabel title={market.label}>
                      {market.label}
                    </StyledRankLabel>
                    <StyledRankValue>
                      {formatNumber(market.value)}
                    </StyledRankValue>
                  </StyledRankLabelRow>
                  <StyledBarTrack>
                    <StyledBarFill
                      style={{
                        width: toBarWidth({
                          maxValue: bestMarketMaxValue,
                          value: market.value,
                        }),
                      }}
                    />
                  </StyledBarTrack>
                  <StyledSecondaryText>
                    {formatNumber(market.secondaryValue)}{' '}
                    {market.secondaryLabel}
                  </StyledSecondaryText>
                </StyledRankRow>
              ))
            )}
          </StyledRankRows>
        </StyledPanel>

        <StyledPanel>
          <StyledPanelTitle>چالاکترین موشریفەکان</StyledPanelTitle>
          <StyledRankRows>
            {analytics.mostActiveSupervisors.length === 0 ? (
              <StyledEmptyText>-</StyledEmptyText>
            ) : (
              analytics.mostActiveSupervisors.map((supervisor) => (
                <StyledRankRow key={supervisor.id}>
                  <StyledRankLabelRow>
                    <StyledRankLabel title={supervisor.label}>
                      {supervisor.label}
                    </StyledRankLabel>
                    <StyledRankValue>
                      {formatNumber(supervisor.value)}
                    </StyledRankValue>
                  </StyledRankLabelRow>
                  <StyledBarTrack>
                    <StyledBarFill
                      style={{
                        width: toBarWidth({
                          maxValue: supervisorMaxValue,
                          value: supervisor.value,
                        }),
                      }}
                    />
                  </StyledBarTrack>
                  <StyledSecondaryText>
                    {formatNumber(supervisor.secondaryValue)}{' '}
                    {supervisor.secondaryLabel}
                  </StyledSecondaryText>
                </StyledRankRow>
              ))
            )}
          </StyledRankRows>
        </StyledPanel>

        <StyledPanel>
          <StyledPanelTitle>بەراوردی ناوچەکان</StyledPanelTitle>
          <StyledDistrictGrid>
            <StyledDistrictCell isHeader>ناوچە</StyledDistrictCell>
            <StyledDistrictCell isHeader>مارکێت</StyledDistrictCell>
            <StyledDistrictCell isHeader>سەردان</StyledDistrictCell>
            <StyledDistrictCell isHeader>فرۆشتن</StyledDistrictCell>
            <StyledDistrictCell isHeader>پارەدان</StyledDistrictCell>
            {analytics.districtComparisons.map((district) => (
              <Fragment key={district.district}>
                <StyledDistrictCell>{district.district}</StyledDistrictCell>
                <StyledDistrictCell>
                  {formatNumber(district.activeMarketCount)}
                </StyledDistrictCell>
                <StyledDistrictCell>
                  {formatNumber(district.visitCount)}
                </StyledDistrictCell>
                <StyledDistrictCell>
                  {formatNumber(district.salesCartons)}
                </StyledDistrictCell>
                <StyledDistrictCell>
                  {formatNumber(district.paidAmount)}
                </StyledDistrictCell>
              </Fragment>
            ))}
          </StyledDistrictGrid>
        </StyledPanel>

        <StyledPanel>
          <StyledPanelTitle>ڕەوتی فرۆشتن و پارەدان</StyledPanelTitle>
          <StyledTrendChart>
            {analytics.salesPaymentTrend.map((point) => (
              <StyledTrendPoint key={point.date}>
                <StyledTrendBars>
                  <StyledTrendBar
                    kind="sales"
                    title={`${point.label}: ${formatNumber(
                      point.salesCartons,
                    )}`}
                    style={{
                      height: toBarHeight({
                        maxValue: trendSalesMaxValue,
                        value: point.salesCartons,
                      }),
                    }}
                  />
                  <StyledTrendBar
                    kind="payment"
                    title={`${point.label}: ${formatNumber(point.paidAmount)}`}
                    style={{
                      height: toBarHeight({
                        maxValue: trendPaymentMaxValue,
                        value: point.paidAmount,
                      }),
                    }}
                  />
                </StyledTrendBars>
                <StyledTrendLabel>{point.label}</StyledTrendLabel>
              </StyledTrendPoint>
            ))}
          </StyledTrendChart>
          <StyledLegend>
            <StyledLegendItem kind="sales">فرۆشتن</StyledLegendItem>
            <StyledLegendItem kind="payment">پارەدان</StyledLegendItem>
          </StyledLegend>
        </StyledPanel>

        <StyledPanel>
          <StyledPanelTitle>گەشەی مانگانە</StyledPanelTitle>
          <StyledGrowthGrid>
            <StyledGrowthItem>
              <StyledSecondaryText>فرۆشتنی کارتۆن</StyledSecondaryText>
              <StyledGrowthValue
                tone={getGrowthTone(growth.salesGrowthPercent)}
              >
                {formatGrowth(growth.salesGrowthPercent)}
              </StyledGrowthValue>
              <StyledSecondaryText>
                {formatNumber(growth.currentMonthSalesCartons)} /{' '}
                {formatNumber(growth.previousMonthSalesCartons)}
              </StyledSecondaryText>
            </StyledGrowthItem>
            <StyledGrowthItem>
              <StyledSecondaryText>پارەدان</StyledSecondaryText>
              <StyledGrowthValue
                tone={getGrowthTone(growth.paymentGrowthPercent)}
              >
                {formatGrowth(growth.paymentGrowthPercent)}
              </StyledGrowthValue>
              <StyledSecondaryText>
                {formatNumber(growth.currentMonthPaidAmount)} /{' '}
                {formatNumber(growth.previousMonthPaidAmount)}
              </StyledSecondaryText>
            </StyledGrowthItem>
          </StyledGrowthGrid>
        </StyledPanel>
      </StyledAnalyticsGrid>
    </StyledSection>
  );
};
