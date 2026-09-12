// What a deployment is allowed to say about a model: the prices it negotiated,
// the limits its route caps, and how it names the model. Everything else —
// modalities, reasoning support, efforts, benchmarks — is read from the
// canonical catalog, so a deployment cannot drift from the measured truth by
// restating it.
export type CatalogSpecModelOverrides = {
  label?: string;
  isDeprecated?: boolean;
  // A route can serve a model under a tighter limit than the model's own.
  contextWindowTokens?: number;
  maxOutputTokens?: number;
  inputCostPerMillionTokens?: number;
  outputCostPerMillionTokens?: number;
  cachedInputCostPerMillionTokens?: number;
  cacheCreationCostPerMillionTokens?: number;
};

export type CatalogSpecModel = CatalogSpecModelOverrides & {
  // The model as the canonical catalog names it.
  model: string;
  // The id this route serves it under, when the route renames it
  // (`eu.anthropic.claude-opus-4-7` for a Bedrock deployment of
  // `claude-opus-4-7`). Defaults to the canonical name.
  as?: string;
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
  // Appended to every inherited label, so one route can read as
  // "GPT-5.6 Luna (Azure)" without restating the name of each model.
  labelSuffix?: string;
  models: (string | CatalogSpecModel)[];
};

export type CatalogSpec = {
  providers: CatalogSpecProvider[];
};
