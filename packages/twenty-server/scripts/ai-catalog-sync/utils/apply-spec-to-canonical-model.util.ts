import { OVERRIDABLE_MODEL_FIELDS } from '../constants/overridable-model-fields.constant';
import { type CanonicalModel } from '../types/canonical-model.type';
import {
  type CatalogSpecModel,
  type CatalogSpecProvider,
} from '../types/catalog-spec.type';

export const applySpecToCanonicalModel = ({
  canonicalModel,
  specModel,
  provider,
}: {
  canonicalModel: CanonicalModel;
  specModel: CatalogSpecModel;
  provider: Pick<
    CatalogSpecProvider,
    'dataResidency' | 'zeroDataRetention' | 'labelSuffix'
  >;
}): CanonicalModel => {
  const overrides = Object.fromEntries(
    OVERRIDABLE_MODEL_FIELDS.filter(
      (field) => specModel[field] !== undefined,
    ).map((field) => [field, specModel[field]]),
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
    label: `${specModel.label ?? canonicalModel.label ?? canonicalModel.name}${provider.labelSuffix ?? ''}`,
  };
};
