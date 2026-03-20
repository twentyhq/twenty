import { type RawAiProviderConfig } from '@/settings/admin-panel/ai/types/RawAiProviderConfig';

export type AiProviderItem = Omit<RawAiProviderConfig, 'name'> & {
  id: string;
  // Config key used for API calls and routing (e.g. 'openai-standard')
  name: string;
  // models.dev provider identifier for icon/label lookups (e.g. 'openai')
  modelsDevName: string;
};
