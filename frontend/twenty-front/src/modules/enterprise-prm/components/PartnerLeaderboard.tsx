import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { GET_PARTNER_LEADERBOARD } from '../hooks/usePRM';
import { PartnerRanking, PartnerTier } from '../types/prm.types';

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

const StyledDetail = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledError = styled.div`
  color: ${themeCssVariables.color.red};
  padding: ${themeCssVariables.spacing[4]};
`;

export const PartnerLeaderboard = () => {
  useLingui();

  const { data, loading, error } = useQuery(GET_PARTNER_LEADERBOARD, {
    variables: { limit: 10 },
  });

  if (loading) {
    return (
      <StyledContainer>
        <StyledTitle>{t`Partner Leaderboard`}</StyledTitle>
        <StyledDetail>{t`Loading...`}</StyledDetail>
      </StyledContainer>
    );
  }

  if (error) {
    return (
      <StyledContainer>
        <StyledTitle>{t`Partner Leaderboard`}</StyledTitle>
        <StyledError>{t`Error loading leaderboard`}: {error.message}</StyledError>
      </StyledContainer>
    );
  }

  const rankings: PartnerRanking[] = data?.partnerLeaderboard?.rankings ?? [];

  return (
    <StyledContainer>
      <StyledTitle>{t`Partner Leaderboard`}</StyledTitle>
      {rankings.map((ranking) => (
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
