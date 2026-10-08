import {
  MODEL_ICON_CONFIG,
  type ModelIconConfigKey,
} from '@/ai/constants/ModelIconConfig';

export const isModelIconKey = (key: string): key is ModelIconConfigKey =>
  key in MODEL_ICON_CONFIG;
