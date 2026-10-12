import { type IconComponent } from 'twenty-ui/icon';

import { PROVIDER_ICON_CONFIG } from '@/ai/constants/ProviderIconConfig';
import { isKnownProviderId } from '@/ai/utils/isKnownProviderId';
import { getModelsDevLogoIcon } from '@/ai/utils/getModelsDevLogoIcon';

export const getProviderIcon = (providerType: string): IconComponent =>
  isKnownProviderId(providerType)
    ? PROVIDER_ICON_CONFIG[providerType].Icon
    : getModelsDevLogoIcon(providerType);
