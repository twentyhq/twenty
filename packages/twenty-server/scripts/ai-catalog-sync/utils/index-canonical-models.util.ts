import { type CanonicalCatalog } from '../types/canonical-catalog.type';
import { type CanonicalModel } from '../types/canonical-model.type';

export const indexCanonicalModels = (
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
