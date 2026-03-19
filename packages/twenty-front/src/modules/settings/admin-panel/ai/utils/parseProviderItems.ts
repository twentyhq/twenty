import { type AiProviderItem } from '@/settings/admin-panel/ai/types/AiProviderItem';
import { type RawAiProviderConfig } from '@/settings/admin-panel/ai/types/RawAiProviderConfig';

export const parseProviderItems = (
  rawProviders: Record<string, unknown>,
): AiProviderItem[] =>
  Object.entries(rawProviders as Record<string, RawAiProviderConfig>).map(
    ([name, config]) => ({ id: name, name, ...config }),
  );
