import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { CampaignData, CampaignStatus } from '../types/marketing.types';
import { GET_CAMPAIGNS } from '../hooks/useMarketing';

const STATUS_COLORS: Record<CampaignStatus, string> = {
  draft: themeCssVariables.color.gray50, scheduled: themeCssVariables.color.yellow,
  active: themeCssVariables.color.turquoise, paused: themeCssVariables.color.orange, completed: themeCssVariables.color.blue,
};
const StyledContainer = styled.div`
  display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[2]};
`;
const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0;
`;
const StyledTable = styled.table` width: 100%; border-collapse: collapse; `;
const StyledTh = styled.th`
  text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium};
`;
const StyledTd = styled.td`
  padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;
const StyledBadge = styled.span<{ color: string }>`
  padding: 2px 8px; border-radius: 4px; font-size: ${themeCssVariables.font.size.xs};
  background: ${({ color }) => color}; color: ${themeCssVariables.font.color.inverted};
`;
const StyledHideMobile = styled.td`
  padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light};
  @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; }
`;
const StyledHideMobileHeader = styled.th`
  text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  @media (max-width: ${MOBILE_VIEWPORT}px) { display: none; }
`;

export const CampaignList = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_CAMPAIGNS);
  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;
  const campaigns: CampaignData[] = data?.campaigns?.edges?.map((e: { node: CampaignData }) => e.node) ?? [];
  return (
    <StyledContainer>
      <StyledTitle>{t`Campaigns`}</StyledTitle>
      <StyledTable>
        <thead><tr>
          <StyledTh>{t`Campaign`}</StyledTh><StyledTh>{t`Status`}</StyledTh><StyledTh>{t`Channel`}</StyledTh>
          <StyledHideMobileHeader>{t`Leads`}</StyledHideMobileHeader><StyledHideMobileHeader>{t`ROI`}</StyledHideMobileHeader>
          <StyledHideMobileHeader>{t`Budget`}</StyledHideMobileHeader>
        </tr></thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr key={campaign.id}>
              <StyledTd>{campaign.name}</StyledTd>
              <StyledTd><StyledBadge color={STATUS_COLORS[campaign.status]}>{campaign.status}</StyledBadge></StyledTd>
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
