import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { AccountTier, TargetAccountData } from '../types/abm.types';

const TIER_COLORS: Record<AccountTier, string> = {
  tier_1: themeCssVariables.color.blue,
  tier_2: themeCssVariables.color.orange,
  tier_3: themeCssVariables.color.gray50,
};

const MOCK_ACCOUNTS: TargetAccountData[] = [
  { id: 'TA-1', accountName: 'Acme Corp', tier: 'tier_1', industry: 'Technology', owner: 'Juan Perez', engagementScore: 85, pipeline: 250000 },
  { id: 'TA-2', accountName: 'Beta Inc', tier: 'tier_1', industry: 'Finance', owner: 'Maria Lopez', engagementScore: 72, pipeline: 180000 },
  { id: 'TA-3', accountName: 'Gamma Ltd', tier: 'tier_2', industry: 'Healthcare', owner: 'Ana Torres', engagementScore: 58, pipeline: 95000 },
  { id: 'TA-4', accountName: 'Delta SA', tier: 'tier_3', industry: 'Retail', owner: 'Luis Reyes', engagementScore: 34, pipeline: 45000 },
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

const StyledBadge = styled.span<{ color: string }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  background: ${({ color }) => color};
  color: ${themeCssVariables.font.color.inverted};
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

export const TargetAccountList = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Target Accounts`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Account`}</StyledTh>
            <StyledTh>{t`Tier`}</StyledTh>
            <StyledTh>{t`Owner`}</StyledTh>
            <StyledResponsiveHideHeader>{t`Industry`}</StyledResponsiveHideHeader>
            <StyledResponsiveHideHeader>{t`Engagement`}</StyledResponsiveHideHeader>
            <StyledResponsiveHideHeader>{t`Pipeline`}</StyledResponsiveHideHeader>
          </tr>
        </thead>
        <tbody>
          {MOCK_ACCOUNTS.map((account) => (
            <tr key={account.id}>
              <StyledTd>{account.accountName}</StyledTd>
              <StyledTd>
                <StyledBadge color={TIER_COLORS[account.tier]}>
                  {account.tier.replace('_', ' ')}
                </StyledBadge>
              </StyledTd>
              <StyledTd>{account.owner}</StyledTd>
              <StyledResponsiveHide>{account.industry}</StyledResponsiveHide>
              <StyledResponsiveHide>{account.engagementScore}</StyledResponsiveHide>
              <StyledResponsiveHide>${account.pipeline.toLocaleString()}</StyledResponsiveHide>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
