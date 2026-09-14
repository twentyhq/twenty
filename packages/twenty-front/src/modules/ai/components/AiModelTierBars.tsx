import { styled } from '@linaria/react';
import { type AiModelTier } from 'twenty-shared/ai';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { AiModelTierIndicator } from '@/ai/components/AiModelTierIndicator';

const StyledButton = styled.button<{ disabled: boolean }>`
  align-items: center;
  background: transparent;
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  display: flex;
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

type AiModelTierBarsProps = {
  selectedTier: AiModelTier;
  label: string;
  disabled?: boolean;
};

export const AiModelTierBars = ({
  selectedTier,
  label,
  disabled = false,
}: AiModelTierBarsProps) => (
  <StyledButton type="button" aria-label={label} disabled={disabled}>
    <AiModelTierIndicator tier={selectedTier} />
  </StyledButton>
);
