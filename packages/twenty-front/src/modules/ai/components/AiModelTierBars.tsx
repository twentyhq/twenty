import { type AiModelTier } from 'twenty-shared/ai';
import { LightButton, type LightButtonProps } from 'twenty-ui/components/input';

import { AiModelTierIndicator } from '@/ai/components/AiModelTierIndicator';

type AiModelTierBarsProps = Omit<LightButtonProps, 'children'> & {
  selectedTier: AiModelTier;
  label: string;
};

export const AiModelTierBars = ({
  selectedTier,
  label,
  disabled = false,
  ref,
  ...props
}: AiModelTierBarsProps) => (
  <LightButton
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...props}
    ref={ref}
    type="button"
    aria-label={label}
    disabled={disabled}
    emphasis="subtle"
    size="sm"
  >
    <AiModelTierIndicator tier={selectedTier} />
  </LightButton>
);
