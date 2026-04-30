import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { AIUsageMetrics } from '../types/ai.types';
import { GET_USAGE_DASHBOARD } from '../hooks/useAI';

const StyledContainer = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[3]}; `;
const StyledTitle = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const StyledMetricsGrid = styled.div` display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: ${themeCssVariables.spacing[3]}; @media (max-width: ${MOBILE_VIEWPORT}px) { grid-template-columns: 1fr 1fr; } `;
const StyledMetric = styled.div` padding: ${themeCssVariables.spacing[3]}; border: 1px solid ${themeCssVariables.border.color.medium}; border-radius: 8px; display: flex; flex-direction: column; gap: 2px; `;
const StyledMetricLabel = styled.span` font-size: ${themeCssVariables.font.size.xs}; color: ${themeCssVariables.font.color.tertiary}; text-transform: uppercase; `;
const StyledMetricValue = styled.span` font-size: ${themeCssVariables.font.size.lg}; font-weight: ${themeCssVariables.font.weight.medium}; color: ${themeCssVariables.font.color.primary}; `;
const StyledTable = styled.table` width: 100%; border-collapse: collapse; `;
const StyledTh = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; `;
const StyledTd = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; `;

export const AIUsageDashboard = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_USAGE_DASHBOARD);
  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;
  const dashboard = data?.aiUsageDashboard;
  const byDay: AIUsageMetrics[] = dashboard?.byDay ?? [];
  return (
    <StyledContainer>
      <StyledTitle>{t`AI Usage`}</StyledTitle>
      <StyledMetricsGrid>
        <StyledMetric><StyledMetricLabel>{t`Tokens (MTD)`}</StyledMetricLabel><StyledMetricValue>{((dashboard?.totalTokensUsed ?? 0) / 1000000).toFixed(1)}M</StyledMetricValue></StyledMetric>
        <StyledMetric><StyledMetricLabel>{t`Cost (MTD)`}</StyledMetricLabel><StyledMetricValue>${(dashboard?.totalCost ?? 0).toLocaleString()}</StyledMetricValue></StyledMetric>
        <StyledMetric><StyledMetricLabel>{t`API Calls`}</StyledMetricLabel><StyledMetricValue>{(dashboard?.totalRequests ?? 0).toLocaleString()}</StyledMetricValue></StyledMetric>
        <StyledMetric><StyledMetricLabel>{t`Avg Latency`}</StyledMetricLabel><StyledMetricValue>{dashboard?.averageLatency ?? 0}ms</StyledMetricValue></StyledMetric>
      </StyledMetricsGrid>
      <StyledTable>
        <thead><tr><StyledTh>{t`Date`}</StyledTh><StyledTh>{t`Tokens`}</StyledTh><StyledTh>{t`Cost`}</StyledTh><StyledTh>{t`Calls`}</StyledTh></tr></thead>
        <tbody>
          {byDay.map((row) => (
            <tr key={row.date ?? row.period}>
              <StyledTd>{row.date ?? row.period}</StyledTd>
              <StyledTd>{((row.tokensUsed ?? 0) / 1000000).toFixed(1)}M</StyledTd>
              <StyledTd>${(row.cost ?? row.totalCost ?? 0).toLocaleString()}</StyledTd>
              <StyledTd>{(row.requests ?? row.apiCalls ?? 0).toLocaleString()}</StyledTd>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
