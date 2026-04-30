import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { CampaignData, CampaignStatus } from '../types/marketing.types';

const MOCK_CAMPAIGNS: CampaignData[] = [
  { id: 'CM1', name: 'Q2 Product Launch', status: 'active', channel: 'email', budget: 25000000, spent: 18000000, leads: 320, roi: 285, currency: 'COP', startDate: '2026-04-01', endDate: '2026-06-30' },
  { id: 'CM2', name: 'Brand Awareness LATAM', status: 'active', channel: 'social', budget: 40000000, spent: 22000000, leads: 180, roi: 150, currency: 'COP', startDate: '2026-03-15', endDate: '2026-09-30' },
  { id: 'CM3', name: 'Retargeting Q1 Leads', status: 'completed', channel: 'paid_search', budget: 10000000, spent: 9800000, leads: 95, roi: 420, currency: 'COP', startDate: '2026-01-15', endDate: '2026-03-31' },
  { id: 'CM4', name: 'Partner Co-Marketing', status: 'scheduled', channel: 'content', budget: 15000000, spent: 0, leads: 0, roi: 0, currency: 'COP', startDate: '2026-05-01', endDate: '2026-07-31' },
];

const STATUS_COLORS: Record<CampaignStatus, string> = {
  draft: themeCssVariables.color.gray50,
  scheduled: themeCssVariables.color.yellow,
  active: themeCssVariables.color.turquoise,
  paused: themeCssVariables.color.orange,
  completed: themeCssVariables.color.blue,
};

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
  background: ${({ color }) => color};
  color: ${themeCssVariables.font.color.inverted};
`;

const StyledHideMobile = styled.td`
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; }
`;

const StyledHideMobileHeader = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; }
`;

export const CampaignList = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Campaigns`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Campaign`}</StyledTh>
            <StyledTh>{t`Status`}</StyledTh>
            <StyledTh>{t`Channel`}</StyledTh>
            <StyledHideMobileHeader>{t`Leads`}</StyledHideMobileHeader>
            <StyledHideMobileHeader>{t`ROI`}</StyledHideMobileHeader>
            <StyledHideMobileHeader>{t`Budget`}</StyledHideMobileHeader>
          </tr>
        </thead>
        <tbody>
          {MOCK_CAMPAIGNS.map((campaign) => (
            <tr key={campaign.id}>
              <StyledTd>{campaign.name}</StyledTd>
              <StyledTd>
                <StyledBadge color={STATUS_COLORS[campaign.status]}>{campaign.status}</StyledBadge>
              </StyledTd>
              <StyledTd>{campaign.channel.replace('_', ' ')}</StyledTd>
              <StyledHideMobile>{campaign.leads}</StyledHideMobile>
              <StyledHideMobile>{campaign.roi}%</StyledHideMobile>
              <StyledHideMobile>${campaign.budget.toLocaleString()}</StyledHideMobile>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
