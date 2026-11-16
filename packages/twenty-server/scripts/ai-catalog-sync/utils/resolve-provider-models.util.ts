import { type CanonicalCatalog } from '../types/canonical-catalog.type';
import { type CanonicalModel } from '../types/canonical-model.type';
import {
  type CatalogSpecModel,
  type CatalogSpecProvider,
} from '../types/catalog-spec.type';
import { assertInferenceProfileMatchesResidency } from './assert-inference-profile-matches-residency.util';
import { assertModelNumbersAreUsable } from './assert-model-numbers-are-usable.util';

const asSpecModel = (entry: string | CatalogSpecModel): CatalogSpecModel =>
  typeof entry === 'string' ? { model: entry } : entry;

// A route to a model the catalog lacks would make tier chains silently fall through to a neighbouring rung
export const resolveProviderModels = ({
  provider,
  canonicalCatalog,
  canonicalModels,
}: {
  provider: CatalogSpecProvider;
  canonicalCatalog: CanonicalCatalog;
  canonicalModels: Map<string, CanonicalModel>;
}): { canonicalModel: CanonicalModel; specModel: CatalogSpecModel }[] => {
  if (!Array.isArray(provider.models)) {
    const { vendor } = provider.models;
    const vendorModels = canonicalCatalog[vendor]?.models ?? [];

    if (vendorModels.length === 0) {
      throw new Error(
        `Provider "${provider.name}" serves every model from "${vendor}", which the catalog does not carry`,
      );
    }

    return vendorModels.map((canonicalModel) => {
      assertInferenceProfileMatchesResidency({
        provider,
        modelName: canonicalModel.name,
      });

      return { canonicalModel, specModel: { model: canonicalModel.name } };
    });
  }

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
    assertModelNumbersAreUsable({ provider, specModel });
    assertInferenceProfileMatchesResidency({
      provider,
      modelName: specModel.as ?? specModel.model,
    });

    const canonicalModel = canonicalModels.get(specModel.model);

    if (canonicalModel === undefined) {
      throw new Error(`The catalog does not carry ${specModel.model}`);
    }

    return { canonicalModel, specModel };
  });
};
