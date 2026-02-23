import { type IconComponent } from 'twenty-ui/display';

import { MODEL_FAMILY_CONFIG } from '~/pages/settings/ai/constants/SettingsAiModelProviders';

// GraphQL enums return uppercase keys (e.g. OPENAI) while the REST
// API returns lowercase values (e.g. openai). Normalize before lookup.
const normalizeModelFamily = (modelFamily: string): string =>
  modelFamily.toLowerCase();

export const getModelIcon = (
  modelFamily: string | null | undefined,
): IconComponent => {
  if (!modelFamily) {
    return MODEL_FAMILY_CONFIG.FALLBACK.Icon;
  }

  const key = normalizeModelFamily(modelFamily);

  return MODEL_FAMILY_CONFIG[key]?.Icon ?? MODEL_FAMILY_CONFIG.FALLBACK.Icon;
};

export const getModelProviderLabel = (
  modelFamily: string | null | undefined,
): string => {
  if (!modelFamily) {
    return '';
  }

  const key = normalizeModelFamily(modelFamily);

  return MODEL_FAMILY_CONFIG[key]?.label ?? modelFamily;
};
