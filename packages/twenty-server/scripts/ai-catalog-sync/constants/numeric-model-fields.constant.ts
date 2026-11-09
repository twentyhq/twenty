import { type CatalogSpecModelOverrides } from '../types/catalog-spec.type';

export const NUMERIC_MODEL_FIELDS = [
  'contextWindowTokens',
  'maxOutputTokens',
  'inputCostPerMillionTokens',
  'outputCostPerMillionTokens',
  'cachedInputCostPerMillionTokens',
  'cacheCreationCostPerMillionTokens',
] as const satisfies readonly (keyof CatalogSpecModelOverrides)[];
