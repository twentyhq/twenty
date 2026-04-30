import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { PayrollPeriod, PayrollSummary } from '../types/hrm.types';
import { CALCULATE_PAYROLL, GET_WORKFORCE_ANALYTICS } from '../hooks/useHRM';

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

const StyledSelect = styled.select`
  padding: ${themeCssVariables.spacing[2]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  background: ${themeCssVariables.background.transparent.lighter};
  align-self: flex-start;
`;

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
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
  gap: ${themeCssVariables.spacing[1]};
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

const StyledStatus = styled.span<{ status: string }>`
  font-size: ${themeCssVariables.font.size.xs};
  padding: 2px 6px;
  border-radius: 4px;
  align-self: flex-start;
  background: ${({ status }) =>
    status === 'completed' ? themeCssVariables.color.turquoise
    : status === 'processing' ? themeCssVariables.color.yellow
    : themeCssVariables.color.gray50};
  color: ${themeCssVariables.font.color.inverted};
`;

export const PayrollDashboard = () => {
  useLingui();

  const { data, loading, error } = useQuery(GET_WORKFORCE_ANALYTICS);

  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;

  const analytics = data?.workforceAnalytics;
  const summary: PayrollSummary | undefined = analytics ? {
    periodId: 'current',
    totalGross: analytics.totalEmployees * 1875000,
    totalDeductions: analytics.totalEmployees * 520000,
    totalNet: analytics.totalEmployees * 1355000,
    employeeCount: analytics.totalEmployees ?? 0,
    currency: 'COP',
  } : undefined;

  return (
    <StyledContainer>
      <StyledTitle>{t`Payroll`}</StyledTitle>
      {summary && (
        <StyledGrid>
          <StyledMetric>
            <StyledMetricLabel>{t`Gross Pay`}</StyledMetricLabel>
            <StyledMetricValue>${summary.totalGross.toLocaleString()}</StyledMetricValue>
          </StyledMetric>
          <StyledMetric>
            <StyledMetricLabel>{t`Deductions`}</StyledMetricLabel>
            <StyledMetricValue>${summary.totalDeductions.toLocaleString()}</StyledMetricValue>
          </StyledMetric>
          <StyledMetric>
            <StyledMetricLabel>{t`Net Pay`}</StyledMetricLabel>
            <StyledMetricValue>${summary.totalNet.toLocaleString()}</StyledMetricValue>
          </StyledMetric>
          <StyledMetric>
            <StyledMetricLabel>{t`Employees`}</StyledMetricLabel>
            <StyledMetricValue>{summary.employeeCount}</StyledMetricValue>
          </StyledMetric>
        </StyledGrid>
      )}
    </StyledContainer>
  );
};
