export type RawAiProviderConfig = {
  type: string;
  source?: 'catalog' | 'custom';
  baseUrl?: string;
  region?: string;
  dataResidency?: string;
  apiKey?: string;
  hasAccessKey?: boolean;
};
