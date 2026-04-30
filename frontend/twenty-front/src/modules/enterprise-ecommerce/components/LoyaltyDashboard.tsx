import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { GET_LOYALTY_STATS } from '../hooks/useECommerce';
import { LoyaltyMember, LoyaltyTier } from '../types/ecommerce.types';

const TIER_COLORS: Record<LoyaltyTier, string> = {
  bronze: themeCssVariables.color.orange,
  silver: themeCssVariables.color.gray50,
  gold: themeCssVariables.color.yellow,
  platinum: themeCssVariables.color.blue,
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

const StyledStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
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
  gap: 2px;
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

const StyledDetail = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledError = styled.div`
  color: ${themeCssVariables.color.red};
  padding: ${themeCssVariables.spacing[4]};
`;

export const LoyaltyDashboard = () => {
  useLingui();

  const { data, loading, error } = useQuery(GET_LOYALTY_STATS);

  if (loading) {
    return (
      <StyledContainer>
        <StyledTitle>{t`Loyalty Program`}</StyledTitle>
        <StyledDetail>{t`Loading...`}</StyledDetail>
      </StyledContainer>
    );
  }

  if (error) {
    return (
      <StyledContainer>
        <StyledTitle>{t`Loyalty Program`}</StyledTitle>
        <StyledError>{t`Error loading loyalty data`}: {error.message}</StyledError>
      </StyledContainer>
    );
  }

  const stats = data?.loyaltyStats;
  const members: LoyaltyMember[] = stats?.members ?? [];

  return (
    <StyledContainer>
      <StyledTitle>{t`Loyalty Program`}</StyledTitle>
      <StyledStatsGrid>
        <StyledMetric>
          <StyledMetricLabel>{t`Members`}</StyledMetricLabel>
          <StyledMetricValue>{(stats?.totalMembers ?? 0).toLocaleString()}</StyledMetricValue>
        </StyledMetric>
        <StyledMetric>
          <StyledMetricLabel>{t`Active`}</StyledMetricLabel>
          <StyledMetricValue>{(stats?.activeMembers ?? 0).toLocaleString()}</StyledMetricValue>
        </StyledMetric>
        <StyledMetric>
          <StyledMetricLabel>{t`Points Issued`}</StyledMetricLabel>
          <StyledMetricValue>{(stats?.pointsIssued ?? 0).toLocaleString()}</StyledMetricValue>
        </StyledMetric>
        <StyledMetric>
          <StyledMetricLabel>{t`Redemption Rate`}</StyledMetricLabel>
          <StyledMetricValue>{stats?.redemptionRate ?? 0}%</StyledMetricValue>
        </StyledMetric>
      </StyledStatsGrid>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`Member`}</StyledTh>
            <StyledTh>{t`Tier`}</StyledTh>
            <StyledTh>{t`Points`}</StyledTh>
            <StyledTh>{t`Lifetime Spend`}</StyledTh>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <StyledTd>{member.name}</StyledTd>
              <StyledTd>
                <StyledBadge color={TIER_COLORS[member.tier]}>{member.tier}</StyledBadge>
              </StyledTd>
              <StyledTd>{member.points.toLocaleString()}</StyledTd>
              <StyledTd>${member.lifetimeSpend.toLocaleString()}</StyledTd>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
