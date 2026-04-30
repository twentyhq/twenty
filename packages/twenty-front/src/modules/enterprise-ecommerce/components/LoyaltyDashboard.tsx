import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { LoyaltyMember, LoyaltyStats, LoyaltyTier } from '../types/ecommerce.types';

const MOCK_STATS: LoyaltyStats = {
  totalMembers: 1250,
  activeMembers: 890,
  pointsIssued: 2500000,
  pointsRedeemed: 1800000,
  redemptionRate: 72,
};

const MOCK_MEMBERS: LoyaltyMember[] = [
  { id: 'L1', name: 'Maria Lopez', tier: 'platinum', points: 45000, lifetimeSpend: 12500000, currency: 'COP', joinedAt: '2023-01-15' },
  { id: 'L2', name: 'Carlos Ruiz', tier: 'gold', points: 22000, lifetimeSpend: 6800000, currency: 'COP', joinedAt: '2023-06-20' },
  { id: 'L3', name: 'Ana Torres', tier: 'silver', points: 8500, lifetimeSpend: 2400000, currency: 'COP', joinedAt: '2024-03-10' },
  { id: 'L4', name: 'Pedro Gomez', tier: 'bronze', points: 1200, lifetimeSpend: 450000, currency: 'COP', joinedAt: '2025-11-05' },
];

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

export const LoyaltyDashboard = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Loyalty Program`}</StyledTitle>
      <StyledStatsGrid>
        <StyledMetric>
          <StyledMetricLabel>{t`Members`}</StyledMetricLabel>
          <StyledMetricValue>{MOCK_STATS.totalMembers.toLocaleString()}</StyledMetricValue>
        </StyledMetric>
        <StyledMetric>
          <StyledMetricLabel>{t`Active`}</StyledMetricLabel>
          <StyledMetricValue>{MOCK_STATS.activeMembers.toLocaleString()}</StyledMetricValue>
        </StyledMetric>
        <StyledMetric>
          <StyledMetricLabel>{t`Points Issued`}</StyledMetricLabel>
          <StyledMetricValue>{MOCK_STATS.pointsIssued.toLocaleString()}</StyledMetricValue>
        </StyledMetric>
        <StyledMetric>
          <StyledMetricLabel>{t`Redemption Rate`}</StyledMetricLabel>
          <StyledMetricValue>{MOCK_STATS.redemptionRate}%</StyledMetricValue>
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
          {MOCK_MEMBERS.map((member) => (
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
