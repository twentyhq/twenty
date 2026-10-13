import { type IconComponent } from 'twenty-ui/icon';

import { MODEL_ICON_CONFIG } from '@/ai/constants/ModelIconConfig';
import { getProviderIcon } from '@/ai/utils/getProviderIcon';
import { isModelIconKey } from '@/ai/utils/isModelIconKey';
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
