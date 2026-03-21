const KNOWN_PROVIDER_IDS = [
  'openai',
  'anthropic',
  'bedrock',
  'google',
  'mistral',
  'xai',
  'openai-compatible',
] as const;

export type KnownProviderId = (typeof KNOWN_PROVIDER_IDS)[number];

export const isKnownProviderId = (id: string): id is KnownProviderId =>
  (KNOWN_PROVIDER_IDS as readonly string[]).includes(id);
