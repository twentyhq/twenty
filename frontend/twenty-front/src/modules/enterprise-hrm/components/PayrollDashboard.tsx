import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { PayrollPeriod, PayrollSummary } from '../types/hrm.types';

const MOCK_PERIODS: PayrollPeriod[] = [
  { id: 'P1', label: 'April 2026', startDate: '2026-04-01', endDate: '2026-04-30', status: 'processing' },
  { id: 'P2', label: 'March 2026', startDate: '2026-03-01', endDate: '2026-03-31', status: 'completed' },
  { id: 'P3', label: 'February 2026', startDate: '2026-02-01', endDate: '2026-02-28', status: 'completed' },
];

const MOCK_SUMMARIES: Record<string, PayrollSummary> = {
  P1: { periodId: 'P1', totalGross: 45000000, totalDeductions: 12500000, totalNet: 32500000, employeeCount: 24, currency: 'COP' },
  P2: { periodId: 'P2', totalGross: 44800000, totalDeductions: 12400000, totalNet: 32400000, employeeCount: 23, currency: 'COP' },
  P3: { periodId: 'P3', totalGross: 43500000, totalDeductions: 12000000, totalNet: 31500000, employeeCount: 22, currency: 'COP' },
};

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
  const [selectedPeriod, setSelectedPeriod] = useState(MOCK_PERIODS[0].id);
  const summary = MOCK_SUMMARIES[selectedPeriod];
  const period = MOCK_PERIODS.find((p) => p.id === selectedPeriod);

  return (
    <StyledContainer>
      <StyledTitle>{t`Payroll`}</StyledTitle>
      <StyledSelect value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
        {MOCK_PERIODS.map((p) => (
          <option key={p.id} value={p.id}>{p.label}</option>
        ))}
      </StyledSelect>
      {period && <StyledStatus status={period.status}>{period.status}</StyledStatus>}
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
