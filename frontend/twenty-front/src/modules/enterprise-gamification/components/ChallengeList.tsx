import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ChallengeData } from '../types/gamification.types';

const MOCK_CHALLENGES: ChallengeData[] = [
  { id: 'CH-1', title: 'May Sprint', description: 'Close 10 deals in May', targetValue: 10, currentValue: 6, reward: '500 bonus points', deadline: '2026-05-31', status: 'active' },
  { id: 'CH-2', title: 'Pipeline Builder', description: 'Add $200k to pipeline this week', targetValue: 200000, currentValue: 145000, reward: 'Quota Crusher badge', deadline: '2026-05-04', status: 'active' },
  { id: 'CH-3', title: 'Call Champion', description: 'Make 50 discovery calls', targetValue: 50, currentValue: 50, reward: '300 bonus points', deadline: '2026-04-30', status: 'completed' },
  { id: 'CH-4', title: 'Social Seller', description: 'Get 20 LinkedIn responses', targetValue: 20, currentValue: 8, reward: 'Social Star badge', deadline: '2026-04-28', status: 'expired' },
];

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

const StyledCard = styled.div`
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const StyledChallengeTitle = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledBadge = styled.span<{ variant: string }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.xs};
  background: ${({ variant }) =>
    variant === 'active' ? themeCssVariables.color.blue :
    variant === 'completed' ? themeCssVariables.color.green :
    themeCssVariables.color.gray50};
  color: ${themeCssVariables.font.color.inverted};
`;

const StyledDescription = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledProgressBar = styled.div`
  height: 8px;
  background: ${themeCssVariables.background.transparent.lighter};
  border-radius: 4px;
  overflow: hidden;
`;

const StyledProgressFill = styled.div<{ percentage: number }>`
  height: 100%;
  width: ${({ percentage }) => Math.min(percentage, 100)}%;
  background: ${themeCssVariables.color.blue};
  border-radius: 4px;
`;

const StyledMeta = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
`;

export const ChallengeList = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Challenges`}</StyledTitle>
      {MOCK_CHALLENGES.map((challenge) => {
        const percentage = Math.round((challenge.currentValue / challenge.targetValue) * 100);
        return (
          <StyledCard key={challenge.id}>
            <StyledCardHeader>
              <StyledChallengeTitle>{challenge.title}</StyledChallengeTitle>
              <StyledBadge variant={challenge.status}>{challenge.status}</StyledBadge>
            </StyledCardHeader>
            <StyledDescription>{challenge.description}</StyledDescription>
            <StyledProgressBar>
              <StyledProgressFill percentage={percentage} />
            </StyledProgressBar>
            <StyledMeta>{percentage}% &middot; {t`Reward`}: {challenge.reward}</StyledMeta>
          </StyledCard>
        );
      })}
    </StyledContainer>
  );
};
