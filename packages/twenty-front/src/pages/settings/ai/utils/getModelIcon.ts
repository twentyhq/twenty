import { type IconComponent } from 'twenty-ui/display';

import { MODEL_FAMILY_CONFIG } from '~/pages/settings/ai/constants/SettingsAiModelProviders';

export const getModelIcon = (
  modelFamily: string | null | undefined,
): IconComponent => {
  if (!modelFamily) {
    return MODEL_FAMILY_CONFIG.FALLBACK.Icon;
  }

  const key = modelFamily.toLowerCase();

  return MODEL_FAMILY_CONFIG[key]?.Icon ?? MODEL_FAMILY_CONFIG.FALLBACK.Icon;
};
