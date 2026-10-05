// Deliberately not extensible: a field a route cannot restate is one it cannot drift on
export type CatalogSpecModelOverrides = {
  label?: string;
  isDeprecated?: boolean;
  contextWindowTokens?: number;
  maxOutputTokens?: number;
  inputCostPerMillionTokens?: number;
  outputCostPerMillionTokens?: number;
  cachedInputCostPerMillionTokens?: number;
  cacheCreationCostPerMillionTokens?: number;
};

export type CatalogSpecModel = CatalogSpecModelOverrides & {
  model: string;
  // e.g. `eu.anthropic.claude-opus-4-7` for a Bedrock deployment of `claude-opus-4-7`
  as?: string;
};

// A route serving a whole vendor picks up new models with the daily sync
export type CatalogSpecModelSelector = {
  vendor: string;
};

export type CatalogSpecProvider = {
  name: string;
  npm: string;
  label?: string;
  apiKey?: string;
  baseUrl?: string;
  region?: string;
  authType?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
  dataResidency?: string;
  zeroDataRetention?: boolean;
  labelSuffix?: string;
  models: (string | CatalogSpecModel)[] | CatalogSpecModelSelector;
};

export type CatalogSpec = {
  providers: CatalogSpecProvider[];
};
