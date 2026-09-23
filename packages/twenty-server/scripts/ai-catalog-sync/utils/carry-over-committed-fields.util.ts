import { isDefined } from 'twenty-shared/utils';

import { type GeneratedCatalog } from '../types/generated-catalog.type';
import { type GeneratedModel } from '../types/generated-model.type';

// models.dev knows neither which effort levels a model takes nor its routing
// facts, so a rebuild would drop them without this.
const CARRIED_OVER_FIELDS = [
  'efforts',
  'dataResidency',
  'zeroDataRetention',
] as const satisfies readonly (keyof GeneratedModel)[];

export const carryOverCommittedFields = ({
  catalog,
  committedCatalog,
}: {
  catalog: GeneratedCatalog;
  committedCatalog: GeneratedCatalog;
}): void => {
  for (const [providerName, provider] of Object.entries(catalog)) {
    const committedModels = new Map(
      (committedCatalog[providerName]?.models ?? []).map((model) => [
        model.name,
        model,
      ]),
    );

    for (const model of provider.models) {
      const committedModel = committedModels.get(model.name);

      if (!isDefined(committedModel)) {
        continue;
      }

      for (const field of CARRIED_OVER_FIELDS) {
        if (isDefined(committedModel[field])) {
          Object.assign(model, { [field]: committedModel[field] });
        }
      }
    }
  }
};
