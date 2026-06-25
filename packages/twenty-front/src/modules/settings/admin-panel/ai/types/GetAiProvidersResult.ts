import { type RawAiProviderConfig } from '@/settings/admin-panel/ai/types/RawAiProviderConfig';

export type GetAiProvidersResult = {
  getAiProviders: Record<string, RawAiProviderConfig>;
};
