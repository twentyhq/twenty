import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ARRBreakdownData } from '../types/revenue.types';

const MOCK_BREAKDOWN: ARRBreakdownData[] = [
  { period: 'Jan 2026', newBusiness: 120000, expansion: 45000, contraction: -15000, churn: -30000, netChange: 120000, endingARR: 2520000 },
  { period: 'Feb 2026', newBusiness: 95000, expansion: 60000, contraction: -20000, churn: -25000, netChange: 110000, endingARR: 2630000 },
  { period: 'Mar 2026', newBusiness: 110000, expansion: 55000, contraction: -10000, churn: -35000, netChange: 120000, endingARR: 2750000 },
  { period: 'Apr 2026', newBusiness: 80000, expansion: 70000, contraction: -25000, churn: -20000, netChange: 105000, endingARR: 2855000 },
];

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
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

const StyledPositive = styled.span`
  color: ${themeCssVariables.color.green};
`;

const StyledNegative = styled.span`
  color: ${themeCssVariables.color.red};
`;

const StyledResponsiveHide = styled.td`
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

const StyledResponsiveHideHeader = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

const formatCurrency = (value: number) => {
  const prefix = value < 0 ? '-' : '+';
  return `${prefix}$${Math.abs(value / 1000)}k`;
};

export const ARRBreakdown = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`ARR Breakdown`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Period`}</StyledTh>
            <StyledTh>{t`New`}</StyledTh>
            <StyledTh>{t`Expansion`}</StyledTh>
            <StyledResponsiveHideHeader>{t`Contraction`}</StyledResponsiveHideHeader>
            <StyledResponsiveHideHeader>{t`Churn`}</StyledResponsiveHideHeader>
            <StyledTh>{t`Ending ARR`}</StyledTh>
          </tr>
        </thead>
        <tbody>
          {MOCK_BREAKDOWN.map((row) => (
            <tr key={row.period}>
              <StyledTd>{row.period}</StyledTd>
              <StyledTd><StyledPositive>{formatCurrency(row.newBusiness)}</StyledPositive></StyledTd>
              <StyledTd><StyledPositive>{formatCurrency(row.expansion)}</StyledPositive></StyledTd>
              <StyledResponsiveHide><StyledNegative>{formatCurrency(row.contraction)}</StyledNegative></StyledResponsiveHide>
              <StyledResponsiveHide><StyledNegative>{formatCurrency(row.churn)}</StyledNegative></StyledResponsiveHide>
              <StyledTd>${(row.endingARR / 1000).toLocaleString()}k</StyledTd>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
