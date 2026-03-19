import { MODEL_ICON_CONFIG } from '@/settings/admin-panel/ai/constants/SettingsAiModelProviders';

export const getModelFamilyLabel = (
  modelFamily: string | null | undefined,
): string => {
  if (!modelFamily) {
    return '';
  }

  const key = modelFamily.toLowerCase();

  return MODEL_ICON_CONFIG[key]?.label ?? modelFamily;
};
