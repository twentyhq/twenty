import { MODEL_ICON_CONFIG } from '@/settings/admin-panel/ai/constants/ModelIconConfig';

export const getModelFamilyLabel = (modelFamily: string): string =>
  MODEL_ICON_CONFIG[modelFamily]?.label ?? modelFamily;
