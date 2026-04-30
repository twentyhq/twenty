import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { DialerCampaignData } from '../types/voip.types';

const MOCK_CAMPAIGNS: DialerCampaignData[] = [
  { id: 'DC1', name: 'Q2 Lead Follow-up', status: 'active', totalContacts: 500, contacted: 320, connected: 185, connectRate: 57.8, avgCallDuration: 180, startDate: '2026-04-15' },
  { id: 'DC2', name: 'Renewal Reminders', status: 'active', totalContacts: 200, contacted: 145, connected: 98, connectRate: 67.6, avgCallDuration: 120, startDate: '2026-04-20' },
  { id: 'DC3', name: 'Cold Outreach Batch 3', status: 'paused', totalContacts: 1000, contacted: 400, connected: 85, connectRate: 21.3, avgCallDuration: 90, startDate: '2026-04-01' },
  { id: 'DC4', name: 'Event Follow-up', status: 'completed', totalContacts: 150, contacted: 150, connected: 112, connectRate: 74.7, avgCallDuration: 210, startDate: '2026-03-25' },
];

const STATUS_COLORS: Record<string, string> = {
  active: themeCssVariables.color.turquoise,
  paused: themeCssVariables.color.yellow,
  completed: themeCssVariables.color.blue,
  scheduled: themeCssVariables.color.gray50,
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

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${themeCssVariables.spacing[3]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledCard = styled.div`
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledName = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledBadge = styled.span<{ color: string }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.xs};
  background: ${({ color }) => color};
  color: ${themeCssVariables.font.color.inverted};
  align-self: flex-start;
`;

const StyledRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledConnectRate = styled.span<{ rate: number }>`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${({ rate }) =>
    rate > 60 ? themeCssVariables.color.turquoise
    : rate > 40 ? themeCssVariables.color.yellow
    : themeCssVariables.color.red};
`;

const StyledBar = styled.div`
  height: 6px;
  border-radius: 3px;
  background: ${themeCssVariables.background.transparent.medium};
  overflow: hidden;
`;

const StyledBarFill = styled.div<{ percent: number }>`
  height: 100%;
  width: ${({ percent }) => percent}%;
  background: ${themeCssVariables.color.blue};
  border-radius: 3px;
`;

export const DialerCampaigns = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Dialer Campaigns`}</StyledTitle>
      <StyledGrid>
        {MOCK_CAMPAIGNS.map((campaign) => {
          const progressPercent = Math.round((campaign.contacted / campaign.totalContacts) * 100);
          return (
            <StyledCard key={campaign.id}>
              <StyledBadge color={STATUS_COLORS[campaign.status]}>{campaign.status}</StyledBadge>
              <StyledName>{campaign.name}</StyledName>
              <StyledConnectRate rate={campaign.connectRate}>{campaign.connectRate}% {t`connect rate`}</StyledConnectRate>
              <StyledRow>
                <span>{t`Contacted`}: {campaign.contacted}/{campaign.totalContacts}</span>
                <span>{t`Connected`}: {campaign.connected}</span>
              </StyledRow>
              <StyledBar>
                <StyledBarFill percent={progressPercent} />
              </StyledBar>
              <StyledRow>
                <span>{t`Avg Duration`}: {Math.floor(campaign.avgCallDuration / 60)}:{(campaign.avgCallDuration % 60).toString().padStart(2, '0')}</span>
              </StyledRow>
            </StyledCard>
          );
        })}
      </StyledGrid>
    </StyledContainer>
  );
};
