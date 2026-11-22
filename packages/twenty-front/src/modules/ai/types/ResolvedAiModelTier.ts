import { type AiModelTier } from 'twenty-shared/ai';

import { type ClientAiModelConfig } from '~/generated-metadata/graphql';

export type ResolvedAiModelTier = {
  tier: AiModelTier;
  label: string;
  model: ClientAiModelConfig | undefined;
  isPinned: boolean;
  speedDeltaPercent: number | undefined;
  intelligenceDeltaPercent: number | undefined;
  costDeltaPercent: number | undefined;
};
