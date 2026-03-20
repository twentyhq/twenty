import { type IconComponent } from 'twenty-ui/display';

import { MODEL_ICON_CONFIG } from '@/settings/admin-panel/ai/constants/ModelIconConfig';
import { isModelIconKey } from '@/settings/admin-panel/ai/utils/isModelIconKey';
import { getProviderIcon } from '@/settings/admin-panel/ai/utils/getProviderIcon';

export const getModelIcon = (
  modelFamily: string | null | undefined,
  providerName?: string | null,
): IconComponent => {
  if (modelFamily) {
    const key = modelFamily.toLowerCase();

    if (isModelIconKey(key)) {
      return MODEL_ICON_CONFIG[key].Icon;
    }
  }

  if (providerName) {
    return getProviderIcon(providerName);
  }

  return MODEL_ICON_CONFIG.FALLBACK.Icon;
};
