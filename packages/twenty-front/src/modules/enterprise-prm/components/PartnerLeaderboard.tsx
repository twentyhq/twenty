import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { PartnerRanking, PartnerTier } from '../types/prm.types';

const MOCK_RANKINGS: PartnerRanking[] = [
  { rank: 1, partnerId: 'PR1', partnerName: 'TechSolutions CO', tier: 'platinum', totalRevenue: 2500000, dealsWon: 15, currency: 'COP' },
  { rank: 2, partnerId: 'PR2', partnerName: 'DataPros Inc', tier: 'gold', totalRevenue: 1200000, dealsWon: 8, currency: 'COP' },
  { rank: 3, partnerId: 'PR3', partnerName: 'CloudFirst SAS', tier: 'silver', totalRevenue: 350000, dealsWon: 3, currency: 'COP' },
  { rank: 4, partnerId: 'PR4', partnerName: 'Innovate LLC', tier: 'registered', totalRevenue: 0, dealsWon: 0, currency: 'COP' },
];

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

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: 8px;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${themeCssVariables.spacing[1]};
  }
`;

const StyledRank = styled.span`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
  min-width: 30px;
`;

const StyledName = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
`;

const StyledBadge = styled.span<{ color: string }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.xs};
  background: ${({ color }) => color};
  color: ${themeCssVariables.font.color.inverted};
`;

const StyledStat = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
  min-width: 100px;
`;

export const PartnerLeaderboard = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Partner Leaderboard`}</StyledTitle>
      {MOCK_RANKINGS.map((ranking) => (
        <StyledRow key={ranking.partnerId}>
          <StyledRank>#{ranking.rank}</StyledRank>
          <StyledName>{ranking.partnerName}</StyledName>
          <StyledBadge color={TIER_COLORS[ranking.tier]}>{ranking.tier}</StyledBadge>
          <StyledStat>{ranking.dealsWon} {t`deals`}</StyledStat>
          <StyledStat>${ranking.totalRevenue.toLocaleString()}</StyledStat>
        </StyledRow>
      ))}
    </StyledContainer>
  );
};
