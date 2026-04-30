import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { AIUsageMetrics } from '../types/ai.types';

const MOCK_USAGE: AIUsageMetrics[] = [
  { period: 'Apr 2026', tokensUsed: 12500000, totalCost: 850000, apiCalls: 24700, avgLatencyMs: 680, currency: 'COP' },
  { period: 'Mar 2026', tokensUsed: 10800000, totalCost: 720000, apiCalls: 21500, avgLatencyMs: 710, currency: 'COP' },
  { period: 'Feb 2026', tokensUsed: 9200000, totalCost: 615000, apiCalls: 18300, avgLatencyMs: 695, currency: 'COP' },
  { period: 'Jan 2026', tokensUsed: 7500000, totalCost: 500000, apiCalls: 15000, avgLatencyMs: 720, currency: 'COP' },
];

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledMetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: ${themeCssVariables.spacing[3]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const StyledMetric = styled.div`
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StyledMetricLabel = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
  text-transform: uppercase;
`;

const StyledMetricValue = styled.span`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const StyledTh = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
`;

const StyledTd = styled.td`
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

export const AIUsageDashboard = () => {
  useLingui();

  const current = MOCK_USAGE[0];

  return (
    <StyledContainer>
      <StyledTitle>{t`AI Usage`}</StyledTitle>
      <StyledMetricsGrid>
        <StyledMetric>
          <StyledMetricLabel>{t`Tokens (MTD)`}</StyledMetricLabel>
          <StyledMetricValue>{(current.tokensUsed / 1000000).toFixed(1)}M</StyledMetricValue>
        </StyledMetric>
        <StyledMetric>
          <StyledMetricLabel>{t`Cost (MTD)`}</StyledMetricLabel>
          <StyledMetricValue>${current.totalCost.toLocaleString()}</StyledMetricValue>
        </StyledMetric>
        <StyledMetric>
          <StyledMetricLabel>{t`API Calls`}</StyledMetricLabel>
          <StyledMetricValue>{current.apiCalls.toLocaleString()}</StyledMetricValue>
        </StyledMetric>
        <StyledMetric>
          <StyledMetricLabel>{t`Avg Latency`}</StyledMetricLabel>
          <StyledMetricValue>{current.avgLatencyMs}ms</StyledMetricValue>
        </StyledMetric>
      </StyledMetricsGrid>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Period`}</StyledTh>
            <StyledTh>{t`Tokens`}</StyledTh>
            <StyledTh>{t`Cost`}</StyledTh>
            <StyledTh>{t`Calls`}</StyledTh>
          </tr>
        </thead>
        <tbody>
          {MOCK_USAGE.map((row) => (
            <tr key={row.period}>
              <StyledTd>{row.period}</StyledTd>
              <StyledTd>{(row.tokensUsed / 1000000).toFixed(1)}M</StyledTd>
              <StyledTd>${row.totalCost.toLocaleString()}</StyledTd>
              <StyledTd>{row.apiCalls.toLocaleString()}</StyledTd>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
