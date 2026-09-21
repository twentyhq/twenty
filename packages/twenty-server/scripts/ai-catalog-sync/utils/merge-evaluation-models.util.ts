import { type GeneratedCatalog } from '../types/generated-catalog.type';

// models.dev describes language models only — it has no notion of an evaluation
// model, and the sync filters on tool calling besides — so these are
// hand-maintained and folded into the catalog here, before anything is written
// or projected.
//
// Merged per model rather than per vendor: a vendor that ships both kinds keeps
// the language models the sync just fetched, which is what lets an evaluation
// model from an existing provider need nothing but an entry in the source file.
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
