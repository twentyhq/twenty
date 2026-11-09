import { NUMERIC_MODEL_FIELDS } from './numeric-model-fields.constant';
import { type CatalogSpecModelOverrides } from '../types/catalog-spec.type';

export const OVERRIDABLE_MODEL_FIELDS = [
  'label',
  'isDeprecated',
  ...NUMERIC_MODEL_FIELDS,
] as const satisfies readonly (keyof CatalogSpecModelOverrides)[];
