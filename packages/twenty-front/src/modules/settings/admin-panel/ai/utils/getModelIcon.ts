import { type IconComponent } from 'twenty-ui/display';

import { MODEL_ICON_CONFIG } from '@/settings/admin-panel/ai/constants/SettingsAiModelProviders';

export const getModelIcon = (
  modelFamily: string | null | undefined,
): IconComponent => {
  if (!modelFamily) {
    return MODEL_ICON_CONFIG.FALLBACK.Icon;
  }

  const key = modelFamily.toLowerCase();

  return MODEL_ICON_CONFIG[key]?.Icon ?? MODEL_ICON_CONFIG.FALLBACK.Icon;
};
