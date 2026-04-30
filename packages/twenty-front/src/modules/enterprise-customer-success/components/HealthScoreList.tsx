import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { AccountHealthData, HealthScore } from '../types/cs.types';

const HEALTH_COLORS: Record<HealthScore, string> = {
  healthy: themeCssVariables.color.green,
  at_risk: themeCssVariables.color.yellow,
  churning: themeCssVariables.color.red,
};

const MOCK_ACCOUNTS: AccountHealthData[] = [
  { id: 'A-1', accountName: 'Acme Corp', csm: 'Ana Torres', healthScore: 'healthy', nps: 72, lastContactDate: '2026-04-25', arr: 120000, renewalDate: '2026-09-01' },
  { id: 'A-2', accountName: 'Beta Inc', csm: 'Luis Reyes', healthScore: 'at_risk', nps: 35, lastContactDate: '2026-04-10', arr: 85000, renewalDate: '2026-06-15' },
  { id: 'A-3', accountName: 'Gamma Ltd', csm: 'Ana Torres', healthScore: 'churning', nps: 12, lastContactDate: '2026-03-20', arr: 45000, renewalDate: '2026-05-01' },
  { id: 'A-4', accountName: 'Delta SA', csm: 'Maria Lopez', healthScore: 'healthy', nps: 68, lastContactDate: '2026-04-27', arr: 200000, renewalDate: '2026-12-01' },
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

const StyledDot = styled.span<{ color: string }>`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ color }) => color};
  margin-right: ${themeCssVariables.spacing[1]};
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

export const HealthScoreList = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Account Health`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Account`}</StyledTh>
            <StyledTh>{t`Health`}</StyledTh>
            <StyledTh>{t`CSM`}</StyledTh>
            <StyledResponsiveHideHeader>{t`NPS`}</StyledResponsiveHideHeader>
            <StyledResponsiveHideHeader>{t`ARR`}</StyledResponsiveHideHeader>
            <StyledResponsiveHideHeader>{t`Renewal`}</StyledResponsiveHideHeader>
          </tr>
        </thead>
        <tbody>
          {MOCK_ACCOUNTS.map((account) => (
            <tr key={account.id}>
              <StyledTd>{account.accountName}</StyledTd>
              <StyledTd>
                <StyledDot color={HEALTH_COLORS[account.healthScore]} />
                {account.healthScore}
              </StyledTd>
              <StyledTd>{account.csm}</StyledTd>
              <StyledResponsiveHide>{account.nps}</StyledResponsiveHide>
              <StyledResponsiveHide>${account.arr.toLocaleString()}</StyledResponsiveHide>
              <StyledResponsiveHide>{account.renewalDate}</StyledResponsiveHide>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
