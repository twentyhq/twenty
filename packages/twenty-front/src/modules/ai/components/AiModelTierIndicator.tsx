import { styled } from '@linaria/react';
import { AI_MODEL_TIERS, type AiModelTier } from 'twenty-shared/ai';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledIndicator = styled.span`
  align-items: center;
  display: inline-flex;
  flex-shrink: 0;
  gap: 2px;
  height: 12px;
  width: 24px;
`;

const StyledBar = styled.span<{ isReached: boolean }>`
  background: ${({ isReached }) =>
    isReached
      ? themeCssVariables.font.color.secondary
      : themeCssVariables.font.color.extraLight};
  border-radius: 4px;
  flex: 1;
  height: 8px;
`;

type AiModelTierIndicatorProps = {
  tier: AiModelTier;
};

export const AiModelTierIndicator = ({ tier }: AiModelTierIndicatorProps) => {
  const selectedStep = AI_MODEL_TIERS.indexOf(tier);

  return (
    <StyledIndicator aria-hidden="true">
      {AI_MODEL_TIERS.map((modelTier, index) => (
        <StyledBar key={modelTier} isReached={index <= selectedStep} />
      ))}
    </StyledIndicator>
  );
};
