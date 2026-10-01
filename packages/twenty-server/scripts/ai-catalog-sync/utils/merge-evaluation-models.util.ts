import { type GeneratedCatalog } from '../types/generated-catalog.type';

// models.dev has no evaluation models; merged per model so a vendor keeps the language models the sync fetched
export const mergeEvaluationModels = ({
  catalog,
  evaluationModels,
}: {
  catalog: GeneratedCatalog;
  evaluationModels: GeneratedCatalog;
}): void => {
  for (const [vendorName, vendor] of Object.entries(evaluationModels)) {
    const existingVendor = catalog[vendorName] ?? { models: [] };

    catalog[vendorName] = existingVendor;

    for (const model of vendor.models) {
      const existingIndex = existingVendor.models.findIndex(
        (candidate) => candidate.name === model.name,
      );

      if (existingIndex === -1) {
        existingVendor.models.push(model);
        continue;
      }

      existingVendor.models[existingIndex] = model;
    }
  }
};
