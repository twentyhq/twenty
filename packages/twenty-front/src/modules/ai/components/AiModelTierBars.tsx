import { styled } from '@linaria/react';
import { AI_MODEL_TIERS, type AiModelTier } from 'twenty-shared/ai';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const BAR_WIDTH_PX = 3;
const BAR_HEIGHT_PX = 10;

const StyledButton = styled.button<{ disabled: boolean }>`
  align-items: center;
  background: transparent;
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  display: flex;
  gap: 2px;
  height: 24px;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  padding: 0 ${themeCssVariables.spacing[1]};

  &:hover {
    background: ${({ disabled }) =>
      disabled
        ? 'transparent'
        : themeCssVariables.background.transparent.light};
  }
`;

const StyledBar = styled.span<{ isReached: boolean }>`
  background: ${({ isReached }) =>
    isReached
      ? themeCssVariables.font.color.tertiary
      : themeCssVariables.background.tertiary};
  border-radius: ${BAR_WIDTH_PX / 2}px;
  display: block;
  height: ${BAR_HEIGHT_PX}px;
  width: ${BAR_WIDTH_PX}px;
`;

type AiModelTierBarsProps = {
  selectedTier: AiModelTier;
  label: string;
  disabled?: boolean;
};

// One bar per tier, filled up to the selected one, so the composer shows the
// level without spending the space a label would take.
export const AiModelTierBars = ({
  selectedTier,
  label,
  disabled = false,
}: AiModelTierBarsProps) => {
  const selectedStep = AI_MODEL_TIERS.indexOf(selectedTier);

  return (
    <StyledButton type="button" aria-label={label} disabled={disabled}>
      {AI_MODEL_TIERS.map((tier, index) => (
        <StyledBar key={tier} isReached={index <= selectedStep} />
      ))}
    </StyledButton>
  );
};
