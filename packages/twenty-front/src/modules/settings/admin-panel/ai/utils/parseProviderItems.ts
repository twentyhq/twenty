import { type AiProviderItem } from '@/settings/admin-panel/ai/types/AiProviderItem';
import { type RawAiProviderConfig } from '@/settings/admin-panel/ai/types/RawAiProviderConfig';

export const parseProviderItems = (
  rawProviders: Record<string, RawAiProviderConfig>,
): AiProviderItem[] =>
  Object.entries(rawProviders).map(([key, config]) => ({
    ...config,
    id: key,
  }));
