import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ABMCampaignData } from '../types/abm.types';

const MOCK_CAMPAIGNS: ABMCampaignData[] = [
  { id: 'C-1', name: 'Enterprise Q2 Push', tier: 'tier_1', status: 'active', accountsTargeted: 25, engaged: 18, pipeline: 450000, startDate: '2026-04-01' },
  { id: 'C-2', name: 'Mid-Market Expansion', tier: 'tier_2', status: 'active', accountsTargeted: 60, engaged: 32, pipeline: 280000, startDate: '2026-03-15' },
  { id: 'C-3', name: 'Healthcare Vertical', tier: 'tier_1', status: 'paused', accountsTargeted: 15, engaged: 8, pipeline: 120000, startDate: '2026-02-01' },
  { id: 'C-4', name: 'SMB Awareness', tier: 'tier_3', status: 'completed', accountsTargeted: 200, engaged: 95, pipeline: 160000, startDate: '2026-01-10' },
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

const StyledBadge = styled.span<{ variant: string }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.xs};
  background: ${({ variant }) =>
    variant === 'active' ? themeCssVariables.color.green :
    variant === 'completed' ? themeCssVariables.color.blue :
    themeCssVariables.color.gray50};
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

export const ABMCampaigns = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`ABM Campaigns`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Campaign`}</StyledTh>
            <StyledTh>{t`Status`}</StyledTh>
            <StyledTh>{t`Engaged`}</StyledTh>
            <StyledResponsiveHideHeader>{t`Targeted`}</StyledResponsiveHideHeader>
            <StyledResponsiveHideHeader>{t`Pipeline`}</StyledResponsiveHideHeader>
          </tr>
        </thead>
        <tbody>
          {MOCK_CAMPAIGNS.map((campaign) => (
            <tr key={campaign.id}>
              <StyledTd>{campaign.name}</StyledTd>
              <StyledTd>
                <StyledBadge variant={campaign.status}>{campaign.status}</StyledBadge>
              </StyledTd>
              <StyledTd>{campaign.engaged}/{campaign.accountsTargeted}</StyledTd>
              <StyledResponsiveHide>{campaign.accountsTargeted}</StyledResponsiveHide>
              <StyledResponsiveHide>${campaign.pipeline.toLocaleString()}</StyledResponsiveHide>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
