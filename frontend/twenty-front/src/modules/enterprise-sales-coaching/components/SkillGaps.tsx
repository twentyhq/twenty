import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { SkillGapData } from '../types/coaching.types';

const MOCK_SKILLS: SkillGapData[] = [
  { skill: 'Discovery Questions', currentLevel: 7, targetLevel: 9, gap: 2, priority: 'high' },
  { skill: 'Objection Handling', currentLevel: 5, targetLevel: 8, gap: 3, priority: 'high' },
  { skill: 'Product Knowledge', currentLevel: 8, targetLevel: 9, gap: 1, priority: 'low' },
  { skill: 'Negotiation', currentLevel: 4, targetLevel: 8, gap: 4, priority: 'high' },
  { skill: 'Closing Techniques', currentLevel: 6, targetLevel: 8, gap: 2, priority: 'medium' },
  { skill: 'Active Listening', currentLevel: 7, targetLevel: 8, gap: 1, priority: 'medium' },
];

const PRIORITY_COLORS: Record<string, string> = {
  low: themeCssVariables.color.green,
  medium: themeCssVariables.color.yellow,
  high: themeCssVariables.color.red,
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

const StyledRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[2]} 0;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const StyledSkillName = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  min-width: 160px;
`;

const StyledBarContainer = styled.div`
  flex: 1;
  display: flex;
  gap: 4px;
  align-items: center;
  min-width: 200px;
`;

const StyledBarSegment = styled.div<{ width: number; color: string }>`
  height: 20px;
  width: ${({ width }) => width}%;
  background: ${({ color }) => color};
  border-radius: 4px;
`;

const StyledLevels = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
  min-width: 60px;
  text-align: center;
`;

const StyledPriority = styled.span<{ color: string }>`
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${({ color }) => color};
  text-transform: uppercase;
  min-width: 50px;
`;

export const SkillGaps = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Skill Gap Analysis`}</StyledTitle>
      {MOCK_SKILLS.map((skill) => (
        <StyledRow key={skill.skill}>
          <StyledSkillName>{skill.skill}</StyledSkillName>
          <StyledBarContainer>
            <StyledBarSegment
              width={(skill.currentLevel / 10) * 100}
              color={themeCssVariables.color.blue}
            />
            <StyledBarSegment
              width={(skill.gap / 10) * 100}
              color={themeCssVariables.background.transparent.lighter}
            />
          </StyledBarContainer>
          <StyledLevels>{skill.currentLevel}/{skill.targetLevel}</StyledLevels>
          <StyledPriority color={PRIORITY_COLORS[skill.priority]}>{skill.priority}</StyledPriority>
        </StyledRow>
      ))}
    </StyledContainer>
  );
};
