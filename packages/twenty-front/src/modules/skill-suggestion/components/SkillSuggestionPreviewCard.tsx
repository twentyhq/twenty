import { styled } from '@linaria/react';
import { isNonEmptyString } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';

import { DEFAULT_SKILL_ICON } from '@/skill-suggestion/constants/DefaultSkillIcon';
import { SKILL_SUGGESTION_PREVIEW_WIDTH } from '@/skill-suggestion/constants/SkillSuggestionPreviewWidth';
import type { SkillSuggestionItem } from '@/skill-suggestion/types/SkillSuggestionItem';

// Pinned width so the card keeps its shape across skills
const StyledCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: ${SKILL_SUGGESTION_PREVIEW_WIDTH}px;
`;

const StyledHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
  height: 40px;
  padding: 0 ${themeCssVariables.spacing[3]};
`;

const StyledTitleText = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledName = styled.span`
  color: ${themeCssVariables.font.color.light};
  flex-shrink: 0;
  font-weight: ${themeCssVariables.font.weight.regular};
`;

const StyledDescription = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.5;
  max-height: calc(50dvh / var(--t-zoom, 1));
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[3]};
  white-space: pre-wrap;
`;

type SkillSuggestionPreviewCardProps = {
  skill: SkillSuggestionItem;
};

export const SkillSuggestionPreviewCard = ({
  skill,
}: SkillSuggestionPreviewCardProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const Icon = getIcon(skill.icon ?? DEFAULT_SKILL_ICON);

  return (
    <StyledCard>
      <StyledHeader>
        <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        <StyledTitleText>{skill.label}</StyledTitleText>
        <StyledName>/{skill.name}</StyledName>
      </StyledHeader>
      {isNonEmptyString(skill.description) && (
        <StyledDescription>{skill.description}</StyledDescription>
      )}
    </StyledCard>
  );
};
