import { type AiSdkPackage, type DataResidency } from 'twenty-shared/ai';

export type AiProviderSource = 'catalog' | 'custom';

export type RawAiProviderConfig = {
  npm: AiSdkPackage;
  name?: string;
  label?: string;
  source?: AiProviderSource;
  baseUrl?: string;
  region?: string;
  dataResidency?: DataResidency;
  apiKey?: string;
  apiKeyConfigVariable?: string;
  hasAccessKey?: boolean;
};
