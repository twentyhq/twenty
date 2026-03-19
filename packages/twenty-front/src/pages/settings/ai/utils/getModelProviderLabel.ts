import { MODEL_ICON_CONFIG } from '~/pages/settings/ai/constants/SettingsAiModelProviders';

export const getModelProviderLabel = (
  modelFamily: string | null | undefined,
): string => {
  if (!modelFamily) {
    return '';
  }

  const key = modelFamily.toLowerCase();

  return MODEL_ICON_CONFIG[key]?.label ?? modelFamily;
};
