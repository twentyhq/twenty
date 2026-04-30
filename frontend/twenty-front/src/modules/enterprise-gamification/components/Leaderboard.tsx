import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { LeaderboardEntry } from '../types/gamification.types';

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, repName: 'Maria Lopez', points: 4820, deals: 12, streak: 15, avatar: 'ML' },
  { rank: 2, repName: 'Juan Perez', points: 4350, deals: 10, streak: 8, avatar: 'JP' },
  { rank: 3, repName: 'Ana Torres', points: 3980, deals: 9, streak: 12, avatar: 'AT' },
  { rank: 4, repName: 'Luis Reyes', points: 3200, deals: 7, streak: 3, avatar: 'LR' },
  { rank: 5, repName: 'Pedro Ruiz', points: 2750, deals: 6, streak: 5, avatar: 'PR' },
];

const RANK_COLORS: Record<number, string> = {
  1: themeCssVariables.color.yellow,
  2: themeCssVariables.color.gray50,
  3: themeCssVariables.color.orange,
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
  padding: ${themeCssVariables.spacing[2]};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    gap: ${themeCssVariables.spacing[2]};
  }
`;

const StyledRank = styled.span<{ color?: string }>`
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${({ color }) => color || themeCssVariables.font.color.tertiary};
  min-width: 28px;
  text-align: center;
`;

const StyledAvatar = styled.span`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${themeCssVariables.color.blue};
  color: ${themeCssVariables.font.color.inverted};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StyledName = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledMeta = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledPoints = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

export const Leaderboard = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Leaderboard`}</StyledTitle>
      {MOCK_LEADERBOARD.map((entry) => (
        <StyledRow key={entry.rank}>
          <StyledRank color={RANK_COLORS[entry.rank]}>#{entry.rank}</StyledRank>
          <StyledAvatar>{entry.avatar}</StyledAvatar>
          <StyledInfo>
            <StyledName>{entry.repName}</StyledName>
            <StyledMeta>{entry.deals} {t`deals`} &middot; {entry.streak} {t`day streak`}</StyledMeta>
          </StyledInfo>
          <StyledPoints>{entry.points.toLocaleString()} {t`pts`}</StyledPoints>
        </StyledRow>
      ))}
    </StyledContainer>
  );
};
