// twenty-shared by source path rather than by package name: the consuming
// repository runs this from a sparse checkout with no workspace install, so
// 'twenty-shared/ai' would not resolve there.
import { isAiSdkPackage } from '../../../../twenty-shared/src/ai/utils/is-ai-sdk-package.util';
import { isDataResidency } from '../../../../twenty-shared/src/ai/utils/is-data-residency.util';

import {
  type CatalogSpec,
  type CatalogSpecModel,
  type CatalogSpecModelOverrides,
  type CatalogSpecProvider,
} from '../types/catalog-spec.type';

// Structural, so the catalog needs no schema here and this file can run from a
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

const NUMERIC_FIELDS = [
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
  const overrides = Object.fromEntries(
    OVERRIDABLE_FIELDS.filter((field) => specModel[field] !== undefined).map(
      (field) => [field, specModel[field]],
    ),
  );

  const routeFields = {
    ...(provider.dataResidency === undefined
      ? {}
      : { dataResidency: provider.dataResidency }),
    ...(provider.zeroDataRetention === undefined
      ? {}
      : { zeroDataRetention: provider.zeroDataRetention }),
  };

  return {
    ...canonicalModel,
    ...routeFields,
    ...overrides,
    name: specModel.as ?? canonicalModel.name,
    // The suffix marks the route, so it is appended to whichever name the model
    // ends up with rather than to the catalog's.
    label: `${specModel.label ?? canonicalModel.label ?? canonicalModel.name}${provider.labelSuffix ?? ''}`,
  };
};

const assertProviderIsUsable = ({
  provider,
  seenNames,
}: {
  provider: CatalogSpecProvider;
  seenNames: Set<string>;
}): void => {
  // Providers key an object, so a repeat would drop the first one's credentials
  // and models on the floor, and `__proto__` would drop its own.
  if (seenNames.has(provider.name) || provider.name === '__proto__') {
    throw new Error(`Provider "${provider.name}" is repeated or reserved`);
  }

  if (!isAiSdkPackage(provider.npm)) {
    throw new Error(
      `Provider "${provider.name}" names an unsupported SDK package: ${provider.npm}`,
    );
  }

  if (
    provider.dataResidency !== undefined &&
    !isDataResidency(provider.dataResidency)
  ) {
    throw new Error(
      `Provider "${provider.name}" names an unsupported data residency: ${provider.dataResidency}`,
    );
  }
};

const assertNumbersAreUsable = ({
  provider,
  specModel,
}: {
  provider: CatalogSpecProvider;
  specModel: CatalogSpecModel;
}): void => {
  for (const field of NUMERIC_FIELDS) {
    const value = specModel[field];

    if (value !== undefined && (!Number.isFinite(value) || value < 0)) {
      throw new Error(
        `${provider.name}/${specModel.model} sets ${field} to ${value}, which is not a usable number`,
      );
    }
  }
};

// A spec naming a model the catalog does not carry is the failure this whole
// pipeline exists to prevent: it publishes a route to nothing, and the tier
// chains then fall through to a neighbouring rung in silence.
const resolveModels = ({
  provider,
  canonicalModels,
}: {
  provider: CatalogSpecProvider;
  canonicalModels: Map<string, CanonicalModel>;
}): { canonicalModel: CanonicalModel; specModel: CatalogSpecModel }[] => {
  const specModels = provider.models.map(asSpecModel);
  const unknown = specModels
    .filter(({ model }) => !canonicalModels.has(model))
    .map(({ model }) => `${provider.name}/${model}`);

  if (unknown.length > 0) {
    throw new Error(
      `The catalog does not carry: ${unknown.join(', ')}. Check the model names, or wait for the catalog sync to pick them up.`,
    );
  }

  return specModels.map((specModel) => {
    assertNumbersAreUsable({ provider, specModel });

    const canonicalModel = canonicalModels.get(specModel.model);

    if (canonicalModel === undefined) {
      throw new Error(`The catalog does not carry ${specModel.model}`);
    }

    return { canonicalModel, specModel };
  });
};

export const projectCatalog = ({
  canonicalCatalog,
  spec,
}: {
  canonicalCatalog: CanonicalCatalog;
  spec: CatalogSpec;
}): CanonicalCatalog => {
  const canonicalModels = indexCanonicalModels(canonicalCatalog);
  const projected: CanonicalCatalog = {};
  const seenNames = new Set<string>();

  for (const provider of spec.providers) {
    assertProviderIsUsable({ provider, seenNames });
    seenNames.add(provider.name);

    const credentials = Object.fromEntries(
      PROVIDER_CREDENTIAL_FIELDS.filter(
        (field) => provider[field] !== undefined,
      ).map((field) => [field, provider[field]]),
    );

    projected[provider.name] = {
      npm: provider.npm,
      label: provider.label ?? provider.name,
      ...credentials,
      models: resolveModels({ provider, canonicalModels }).map((resolved) =>
        projectModel({ ...resolved, provider }),
      ),
    };
  }

  return projected;
};
