import { MODEL_ICON_CONFIG } from '@/settings/admin-panel/ai/constants/ModelIconConfig';
import { isModelIconKey } from '@/settings/admin-panel/ai/utils/isModelIconKey';

export const getModelFamilyLabel = (modelFamily: string): string => {
  const key = modelFamily.toLowerCase();

  return isModelIconKey(key) ? MODEL_ICON_CONFIG[key].label : modelFamily;
};
