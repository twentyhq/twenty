export type RawAiProviderConfig = {
  type: string;
  source?: 'catalog' | 'custom';
  baseUrl?: string;
  region?: string;
  dataResidency?: string;
  apiKey?: string;
  hasAccessKey?: boolean;
};

export type AiProviderItem = RawAiProviderConfig & {
  id: string;
  name: string;
};

export type GetAiProvidersResult = {
  getAiProviders: Record<string, unknown>;
};

export const parseProviderItems = (
  rawProviders: Record<string, unknown>,
): AiProviderItem[] =>
  Object.entries(rawProviders as Record<string, RawAiProviderConfig>).map(
    ([name, config]) => ({ id: name, name, ...config }),
  );
