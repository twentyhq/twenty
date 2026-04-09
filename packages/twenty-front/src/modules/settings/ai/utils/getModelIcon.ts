import { type IconComponent } from 'twenty-ui/display';

import { MODEL_ICON_CONFIG } from '@/settings/admin-panel/ai/constants/ModelIconConfig';
import { getProviderIcon } from '@/settings/admin-panel/ai/utils/getProviderIcon';
import { isModelIconKey } from '@/settings/admin-panel/ai/utils/isModelIconKey';

import { type ModelFamily } from '~/generated-metadata/graphql';

export const getModelIcon = (
  modelFamily: ModelFamily | null | undefined,
  providerName?: string | null,
): IconComponent => {
  if (modelFamily && isModelIconKey(modelFamily)) {
    return MODEL_ICON_CONFIG[modelFamily];
  }

  if (providerName) {
    return getProviderIcon(providerName);
  }

  return MODEL_ICON_CONFIG.FALLBACK;
};
