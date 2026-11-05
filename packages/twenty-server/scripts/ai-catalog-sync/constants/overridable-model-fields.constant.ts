import { type CatalogSpecModelOverrides } from '../types/catalog-spec.type';

export const OVERRIDABLE_MODEL_FIELDS = [
  'label',
  'isDeprecated',
  'contextWindowTokens',
  'maxOutputTokens',
  'inputCostPerMillionTokens',
  'outputCostPerMillionTokens',
  'cachedInputCostPerMillionTokens',
  'cacheCreationCostPerMillionTokens',
] as const satisfies readonly (keyof CatalogSpecModelOverrides)[];
