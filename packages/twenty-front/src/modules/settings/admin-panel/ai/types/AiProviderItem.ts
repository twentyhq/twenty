import { type RawAiProviderConfig } from '@/settings/admin-panel/ai/types/RawAiProviderConfig';

export type AiProviderItem = RawAiProviderConfig & {
  id: string;
  name: string;
};
