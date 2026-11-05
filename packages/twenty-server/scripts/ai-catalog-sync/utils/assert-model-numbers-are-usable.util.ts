import { NUMERIC_MODEL_FIELDS } from '../constants/numeric-model-fields.constant';
import {
  type CatalogSpecModel,
  type CatalogSpecProvider,
} from '../types/catalog-spec.type';

export const assertModelNumbersAreUsable = ({
  provider,
  specModel,
}: {
  provider: Pick<CatalogSpecProvider, 'name'>;
  specModel: Pick<
    CatalogSpecModel,
    'model' | (typeof NUMERIC_MODEL_FIELDS)[number]
  >;
}): void => {
  for (const field of NUMERIC_MODEL_FIELDS) {
    const value = specModel[field];

    if (value !== undefined && (!Number.isFinite(value) || value < 0)) {
      throw new Error(
        `${provider.name}/${specModel.model} sets ${field} to ${value}, which is not a usable number`,
      );
    }
  }
};
