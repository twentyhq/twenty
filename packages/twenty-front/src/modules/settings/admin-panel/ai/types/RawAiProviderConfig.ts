export type RawAiProviderConfig = {
  // npm package for the AI SDK driver (e.g. '@ai-sdk/openai')
  npm: string;
  // models.dev provider identifier (e.g. 'openai')
  name?: string;
  label?: string;
  source?: 'catalog' | 'custom';
  baseUrl?: string;
  region?: string;
  dataResidency?: string;
  apiKey?: string;
  apiKeyConfigVariable?: string;
  hasAccessKey?: boolean;
};
