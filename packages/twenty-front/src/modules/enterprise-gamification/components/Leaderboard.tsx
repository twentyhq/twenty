import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { LeaderboardEntry } from '../types/gamification.types';
import { GET_GAMIFICATION_DATA } from '../hooks/useGamification';

const RANK_COLORS: Record<number, string> = { 1: themeCssVariables.color.yellow, 2: themeCssVariables.color.gray50, 3: themeCssVariables.color.orange };
const StyledContainer = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[2]}; `;
const StyledTitle = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const StyledRow = styled.div` display: flex; align-items: center; gap: ${themeCssVariables.spacing[3]}; padding: ${themeCssVariables.spacing[2]}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; @media (max-width: ${MOBILE_VIEWPORT}px) { gap: ${themeCssVariables.spacing[2]}; } `;
const StyledRank = styled.span<{ color?: string }>` font-size: ${themeCssVariables.font.size.lg}; font-weight: ${themeCssVariables.font.weight.medium}; color: ${({ color }) => color || themeCssVariables.font.color.tertiary}; min-width: 28px; text-align: center; `;
const StyledAvatar = styled.span` width: 36px; height: 36px; border-radius: 50%; background: ${themeCssVariables.color.blue}; color: ${themeCssVariables.font.color.inverted}; display: flex; align-items: center; justify-content: center; font-size: ${themeCssVariables.font.size.sm}; font-weight: ${themeCssVariables.font.weight.medium}; `;
const StyledInfo = styled.div` flex: 1; display: flex; flex-direction: column; gap: 2px; `;
const StyledName = styled.span` font-size: ${themeCssVariables.font.size.md}; font-weight: ${themeCssVariables.font.weight.medium}; color: ${themeCssVariables.font.color.primary}; `;
const StyledMeta = styled.span` font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.secondary}; `;
const StyledPoints = styled.span` font-size: ${themeCssVariables.font.size.md}; font-weight: ${themeCssVariables.font.weight.medium}; color: ${themeCssVariables.font.color.primary}; `;

export const Leaderboard = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_GAMIFICATION_DATA);
  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;
  const entries: LeaderboardEntry[] = data?.gamificationData?.leaderboard ?? [];
  return (
    <StyledContainer>
      <StyledTitle>{t`Leaderboard`}</StyledTitle>
      {entries.map((e) => (<StyledRow key={e.rank}><StyledRank color={RANK_COLORS[e.rank]}>#{e.rank}</StyledRank><StyledAvatar>{e.avatar}</StyledAvatar><StyledInfo><StyledName>{e.repName}</StyledName><StyledMeta>{e.deals} {t`deals`} &middot; {e.streak} {t`day streak`}</StyledMeta></StyledInfo><StyledPoints>{e.points.toLocaleString()} {t`pts`}</StyledPoints></StyledRow>))}
    </StyledContainer>
  );
};
