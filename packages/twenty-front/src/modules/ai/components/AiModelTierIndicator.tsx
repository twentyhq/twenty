import { AI_MODEL_TIERS, type AiModelTier } from 'twenty-shared/ai';

import { AudioBars } from '@/ui/feedback/audio-bars/components/AudioBars';

type AiModelTierIndicatorProps = {
  tier: AiModelTier;
};

export const AiModelTierIndicator = ({ tier }: AiModelTierIndicatorProps) => (
  <AudioBars activeBars={AI_MODEL_TIERS.indexOf(tier) + 1} />
);
