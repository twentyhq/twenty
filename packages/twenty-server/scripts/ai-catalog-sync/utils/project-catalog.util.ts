import {
  type CatalogSpec,
  type CatalogSpecModel,
  type CatalogSpecModelOverrides,
  type CatalogSpecProvider,
} from '../types/catalog-spec.type';

// Structural, so this file stays free of workspace imports and can run from a
// checkout that has not installed the monorepo.
type CanonicalModel = { name: string; label?: string } & Record<
  string,
  unknown
>;
type CanonicalProvider = { models?: CanonicalModel[] } & Record<
  string,
  unknown
>;
export type CanonicalCatalog = Record<string, CanonicalProvider>;

const OVERRIDABLE_FIELDS = [
  'label',
  'isDeprecated',
  'contextWindowTokens',
  'maxOutputTokens',
  'inputCostPerMillionTokens',
  'outputCostPerMillionTokens',
  'cachedInputCostPerMillionTokens',
  'cacheCreationCostPerMillionTokens',
] as const satisfies readonly (keyof CatalogSpecModelOverrides)[];

const PROVIDER_CREDENTIAL_FIELDS = [
  'label',
  'apiKey',
  'baseUrl',
  'region',
  'authType',
  'accessKeyId',
  'secretAccessKey',
  'sessionToken',
] as const;

const asSpecModel = (entry: string | CatalogSpecModel): CatalogSpecModel =>
  typeof entry === 'string' ? { model: entry } : entry;

const indexCanonicalModels = (
  catalog: CanonicalCatalog,
): Map<string, CanonicalModel> => {
  const models = new Map<string, CanonicalModel>();

  for (const provider of Object.values(catalog)) {
    for (const model of provider.models ?? []) {
      models.set(model.name, model);
    }
  }

  return models;
};

const projectModel = ({
  canonicalModel,
  specModel,
  provider,
}: {
  canonicalModel: CanonicalModel;
  specModel: CatalogSpecModel;
  provider: CatalogSpecProvider;
}): CanonicalModel => {
  const label = `${canonicalModel.label ?? canonicalModel.name}${provider.labelSuffix ?? ''}`;

  const routeFields = {
    ...(provider.dataResidency === undefined
      ? {}
      : { dataResidency: provider.dataResidency }),
    ...(provider.zeroDataRetention === undefined
      ? {}
      : { zeroDataRetention: provider.zeroDataRetention }),
  };

  const overrides = Object.fromEntries(
    OVERRIDABLE_FIELDS.filter((field) => specModel[field] !== undefined).map(
      (field) => [field, specModel[field]],
    ),
  );

  return {
    ...canonicalModel,
    name: specModel.as ?? canonicalModel.name,
    label,
    ...routeFields,
    ...overrides,
  };
};

// A spec naming a model the catalog does not carry is the failure this whole
// pipeline exists to prevent: it publishes a route to nothing, and the tier
// chains then fall through to a neighbouring rung in silence.
const findUnknownModels = ({
  spec,
  canonicalModels,
}: {
  spec: CatalogSpec;
  canonicalModels: Map<string, CanonicalModel>;
}): string[] =>
  spec.providers.flatMap((provider) =>
    provider.models
      .map(asSpecModel)
      .filter(({ model }) => !canonicalModels.has(model))
      .map(({ model }) => `${provider.name}/${model}`),
  );

export const projectCatalog = ({
  canonicalCatalog,
  spec,
}: {
  canonicalCatalog: CanonicalCatalog;
  spec: CatalogSpec;
}): CanonicalCatalog => {
  const canonicalModels = indexCanonicalModels(canonicalCatalog);
  const unknownModels = findUnknownModels({ spec, canonicalModels });

  if (unknownModels.length > 0) {
    throw new Error(
      `The catalog does not carry: ${unknownModels.join(', ')}. Check the model names, or wait for the catalog sync to pick them up.`,
    );
  }

  const projected: CanonicalCatalog = {};

  for (const provider of spec.providers) {
    const credentials = Object.fromEntries(
      PROVIDER_CREDENTIAL_FIELDS.filter(
        (field) => provider[field] !== undefined,
      ).map((field) => [field, provider[field]]),
    );

    projected[provider.name] = {
      npm: provider.npm,
      label: provider.label ?? provider.name,
      ...credentials,
      models: provider.models.map(asSpecModel).map((specModel) =>
        projectModel({
          // Checked above, so the lookup cannot miss.
          canonicalModel: canonicalModels.get(
            specModel.model,
          ) as CanonicalModel,
          specModel,
          provider,
        }),
      ),
    };
  }

  return projected;
};
