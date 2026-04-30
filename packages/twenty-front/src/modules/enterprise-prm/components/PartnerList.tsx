import { useMutation, useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import {
  GET_CHANNEL_ANALYTICS,
  GET_PARTNER_LEADERBOARD,
  RECRUIT_PARTNER,
} from '../hooks/usePRM';
import { PartnerTier } from '../types/prm.types';

const TIER_COLORS: Record<PartnerTier, string> = {
  registered: themeCssVariables.color.gray50,
  silver: themeCssVariables.color.gray50,
  gold: themeCssVariables.color.yellow,
  platinum: themeCssVariables.color.blue,
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledToolbar = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  flex-wrap: wrap;
  align-items: center;
`;

const StyledButton = styled.button`
  padding: 6px 14px;
  border: none;
  border-radius: 4px;
  background: ${themeCssVariables.color.blue};
  color: ${themeCssVariables.font.color.inverted};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledInput = styled.input`
  padding: 6px 10px;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.sm};
  min-width: 120px;
`;

const StyledSelect = styled.select`
  padding: 6px 10px;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledForm = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  flex-wrap: wrap;
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 8px;
`;

const StyledStatsRow = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
  flex-wrap: wrap;
`;

const StyledStat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StyledStatLabel = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
  text-transform: uppercase;
`;

const StyledStatValue = styled.span`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
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

const StyledBar = styled.div`
  height: 6px;
  border-radius: 3px;
  background: ${themeCssVariables.background.transparent.medium};
  overflow: hidden;
  width: 80px;
`;

const StyledBarFill = styled.div<{ percent: number }>`
  height: 100%;
  width: ${({ percent }) => Math.min(percent, 100)}%;
  background: ${themeCssVariables.color.blue};
  border-radius: 3px;
`;

const StyledHideMobile = styled.td`
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

const StyledHideMobileHeader = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

const StyledLoading = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledError = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  color: ${themeCssVariables.color.red};
`;

export const PartnerList = () => {
  useLingui();

  const [showForm, setShowForm] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [tier, setTier] = useState<PartnerTier>('registered');

  const { data, loading, error, refetch } = useQuery(GET_CHANNEL_ANALYTICS);
  const { data: leaderboardData } = useQuery(GET_PARTNER_LEADERBOARD, {
    variables: { limit: 20 },
  });

  const [recruitPartner, { loading: recruiting }] = useMutation(
    RECRUIT_PARTNER,
    {
      onCompleted: () => {
        setCompanyName('');
        setContactName('');
        setShowForm(false);
        refetch();
      },
    },
  );

  const handleRecruit = () => {
    if (!companyName || !contactName) return;
    recruitPartner({
      variables: { input: { companyName, contactName, tier } },
    });
  };

  if (loading) return <StyledLoading>{t`Loading...`}</StyledLoading>;
  if (error) return <StyledError>{t`Error: ${error.message}`}</StyledError>;

  const analytics = data?.channelAnalytics;
  const rankings = leaderboardData?.partnerLeaderboard?.rankings ?? [];

  return (
    <StyledContainer>
      <StyledToolbar>
        <StyledStatValue>{t`Partners`}</StyledStatValue>
        <StyledButton onClick={() => setShowForm(!showForm)}>
          {showForm ? t`Cancel` : t`Recruit Partner`}
        </StyledButton>
      </StyledToolbar>

      <StyledStatsRow>
        <StyledStat>
          <StyledStatLabel>{t`Total Partners`}</StyledStatLabel>
          <StyledStatValue>{analytics?.totalPartners ?? 0}</StyledStatValue>
        </StyledStat>
        <StyledStat>
          <StyledStatLabel>{t`Active`}</StyledStatLabel>
          <StyledStatValue>{analytics?.activePartners ?? 0}</StyledStatValue>
        </StyledStat>
        <StyledStat>
          <StyledStatLabel>{t`Channel Revenue`}</StyledStatLabel>
          <StyledStatValue>
            ${(analytics?.totalChannelRevenue ?? 0).toLocaleString()}
          </StyledStatValue>
        </StyledStat>
        <StyledStat>
          <StyledStatLabel>{t`Approval Rate`}</StyledStatLabel>
          <StyledStatValue>{analytics?.approvalRate ?? 0}%</StyledStatValue>
        </StyledStat>
      </StyledStatsRow>

      {showForm && (
        <StyledForm>
          <StyledInput
            placeholder={t`Company name`}
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
          />
          <StyledInput
            placeholder={t`Contact name`}
            value={contactName}
            onChange={(event) => setContactName(event.target.value)}
          />
          <StyledSelect
            value={tier}
            onChange={(event) =>
              setTier(event.target.value as PartnerTier)
            }
          >
            <option value="registered">{t`Registered`}</option>
            <option value="silver">{t`Silver`}</option>
            <option value="gold">{t`Gold`}</option>
            <option value="platinum">{t`Platinum`}</option>
          </StyledSelect>
          <StyledButton onClick={handleRecruit} disabled={recruiting}>
            {recruiting ? t`Recruiting...` : t`Add`}
          </StyledButton>
        </StyledForm>
      )}

      <StyledTable>
        <thead>
          <tr>
            <StyledTh>#</StyledTh>
            <StyledTh>{t`Partner`}</StyledTh>
            <StyledTh>{t`Tier`}</StyledTh>
            <StyledTh>{t`Revenue`}</StyledTh>
            <StyledHideMobileHeader>{t`Deals Won`}</StyledHideMobileHeader>
          </tr>
        </thead>
        <tbody>
          {rankings.map(
            (partner: {
              rank: number;
              partnerId: string;
              partnerName: string;
              tier: PartnerTier;
              totalRevenue: number;
              dealsWon: number;
              currency: string;
            }) => {
              const maxRevenue = rankings[0]?.totalRevenue || 1;
              const revenuePercent = Math.round(
                (partner.totalRevenue / maxRevenue) * 100,
              );
              return (
                <tr key={partner.partnerId}>
                  <StyledTd>{partner.rank}</StyledTd>
                  <StyledTd>{partner.partnerName}</StyledTd>
                  <StyledTd>
                    <StyledBadge
                      color={
                        TIER_COLORS[partner.tier] ??
                        themeCssVariables.color.gray50
                      }
                    >
                      {partner.tier}
                    </StyledBadge>
                  </StyledTd>
                  <StyledTd>
                    ${partner.totalRevenue.toLocaleString()}
                    <StyledBar>
                      <StyledBarFill percent={revenuePercent} />
                    </StyledBar>
                  </StyledTd>
                  <StyledHideMobile>{partner.dealsWon}</StyledHideMobile>
                </tr>
              );
            },
          )}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
