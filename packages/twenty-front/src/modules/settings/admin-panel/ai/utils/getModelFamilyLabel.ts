import { MODEL_ICON_CONFIG } from '@/settings/admin-panel/ai/constants/ModelIconConfig';
import { isModelIconKey } from '@/settings/admin-panel/ai/utils/isModelIconKey';

export const getModelFamilyLabel = (modelFamily: string): string =>
  isModelIconKey(modelFamily)
    ? MODEL_ICON_CONFIG[modelFamily].label
    : modelFamily;
