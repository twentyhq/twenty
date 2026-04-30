import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { ChallengeData } from '../types/gamification.types';
import { GET_GAMIFICATION_ANALYTICS } from '../hooks/useGamification';

const StyledContainer = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[3]}; `;
const StyledTitle = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const StyledCard = styled.div` padding: ${themeCssVariables.spacing[3]}; border: 1px solid ${themeCssVariables.border.color.light}; border-radius: 8px; display: flex; flex-direction: column; gap: ${themeCssVariables.spacing[2]}; `;
const StyledCardHeader = styled.div` display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: ${themeCssVariables.spacing[1]}; @media (max-width: ${MOBILE_VIEWPORT}px) { flex-direction: column; align-items: flex-start; } `;
const StyledChallengeTitle = styled.span` font-size: ${themeCssVariables.font.size.md}; font-weight: ${themeCssVariables.font.weight.medium}; color: ${themeCssVariables.font.color.primary}; `;
const StyledBadge = styled.span<{ variant: string }>` padding: 2px 8px; border-radius: 4px; font-size: ${themeCssVariables.font.size.xs}; background: ${({ variant }) => variant === 'active' ? themeCssVariables.color.blue : variant === 'completed' ? themeCssVariables.color.green : themeCssVariables.color.gray50}; color: ${themeCssVariables.font.color.inverted}; `;
const StyledDesc = styled.span` font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.secondary}; `;
const StyledProgressBar = styled.div` height: 8px; background: ${themeCssVariables.background.transparent.lighter}; border-radius: 4px; overflow: hidden; `;
const StyledProgressFill = styled.div<{ percentage: number }>` height: 100%; width: ${({ percentage }) => Math.min(percentage, 100)}%; background: ${themeCssVariables.color.blue}; border-radius: 4px; `;
const StyledMeta = styled.span` font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; `;

export const ChallengeList = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_GAMIFICATION_ANALYTICS);
  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;
  const challenges: ChallengeData[] = data?.gamificationAnalytics?.challenges ?? [];
  return (
    <StyledContainer>
      <StyledTitle>{t`Challenges`}</StyledTitle>
      {challenges.map((c) => {
        const pct = c.targetValue > 0 ? Math.round((c.currentValue / c.targetValue) * 100) : 0;
        return (<StyledCard key={c.id}><StyledCardHeader><StyledChallengeTitle>{c.title}</StyledChallengeTitle><StyledBadge variant={c.status}>{c.status}</StyledBadge></StyledCardHeader><StyledDesc>{c.description}</StyledDesc><StyledProgressBar><StyledProgressFill percentage={pct} /></StyledProgressBar><StyledMeta>{pct}% &middot; {t`Reward`}: {c.reward}</StyledMeta></StyledCard>);
      })}
    </StyledContainer>
  );
};
