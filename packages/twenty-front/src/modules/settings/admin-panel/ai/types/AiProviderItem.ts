import { type AiSdkPackage, type DataResidency } from 'twenty-shared/ai';

import { type AiProviderAuthType } from '@/settings/admin-panel/ai/types/AiProviderAuthType';
import { type AiProviderSource } from '@/settings/admin-panel/ai/types/AiProviderSource';

// AiProviderItem = RawAiProviderConfig (from the backend's Record<string,
// RawAiProviderConfig>) enriched with the `id` key (same as the Record key).
// Fields are defined here; RawAiProviderConfig is Omit<AiProviderItem, 'id'>.
export type AiProviderItem = {
  id: string;
  npm: AiSdkPackage;
  // Optional provider display/catalog name from config (not a model name; models use `models[].name` on the backend).
  name?: string;
  label?: string;
  authType?: AiProviderAuthType;
  source?: AiProviderSource;
  baseUrl?: string;
  region?: string;
  dataResidency?: DataResidency;
  apiKey?: string;
  apiKeyConfigVariable?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  hasAccessKey?: boolean;
};
