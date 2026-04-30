import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { BadgeData } from '../types/gamification.types';

const RARITY_COLORS: Record<string, string> = {
  common: themeCssVariables.color.gray50,
  rare: themeCssVariables.color.blue,
  epic: themeCssVariables.color.orange,
  legendary: themeCssVariables.color.yellow,
};

const MOCK_BADGES: BadgeData[] = [
  { id: 'B-1', name: 'First Deal', description: 'Closed your first deal', icon: '\u2B50', earnedAt: '2026-01-15', rarity: 'common' },
  { id: 'B-2', name: 'Quota Crusher', description: 'Exceeded quota by 120%', icon: '\uD83D\uDD25', earnedAt: '2026-03-31', rarity: 'epic' },
  { id: 'B-3', name: 'Perfect Week', description: '5 deals in one week', icon: '\uD83C\uDFC6', earnedAt: '2026-04-10', rarity: 'rare' },
  { id: 'B-4', name: 'Pipeline Legend', description: '$1M+ pipeline in a quarter', icon: '\uD83D\uDC8E', earnedAt: '2026-04-25', rarity: 'legendary' },
  { id: 'B-5', name: 'Team Player', description: 'Helped 10 colleagues close deals', icon: '\uD83E\uDD1D', earnedAt: '2026-02-20', rarity: 'rare' },
  { id: 'B-6', name: 'Early Bird', description: 'Logged in before 7am for 30 days', icon: '\uD83C\uDF05', earnedAt: '2026-04-01', rarity: 'common' },
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

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: ${themeCssVariables.spacing[3]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StyledCard = styled.div<{ borderColor: string }>`
  padding: ${themeCssVariables.spacing[3]};
  border: 2px solid ${({ borderColor }) => borderColor};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${themeCssVariables.spacing[1]};
  text-align: center;
`;

const StyledIcon = styled.span`
  font-size: 32px;
`;

const StyledBadgeName = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledDescription = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledRarity = styled.span<{ color: string }>`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${({ color }) => color};
  text-transform: uppercase;
  font-weight: ${themeCssVariables.font.weight.medium};
`;

export const BadgeGallery = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Badges`}</StyledTitle>
      <StyledGrid>
        {MOCK_BADGES.map((badge) => (
          <StyledCard key={badge.id} borderColor={RARITY_COLORS[badge.rarity]}>
            <StyledIcon>{badge.icon}</StyledIcon>
            <StyledBadgeName>{badge.name}</StyledBadgeName>
            <StyledDescription>{badge.description}</StyledDescription>
            <StyledRarity color={RARITY_COLORS[badge.rarity]}>{badge.rarity}</StyledRarity>
          </StyledCard>
        ))}
      </StyledGrid>
    </StyledContainer>
  );
};
