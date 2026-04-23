import { type IconComponent } from 'twenty-ui/display';

import { PROVIDER_ICON_CONFIG } from '@/settings/admin-panel/ai/constants/ProviderConfig';
import { isKnownProviderId } from '@/settings/admin-panel/ai/utils/isKnownProviderId';
import { getModelsDevLogoIcon } from '@/settings/admin-panel/ai/utils/getModelsDevLogoIcon';

export const getProviderIcon = (providerType: string): IconComponent =>
  isKnownProviderId(providerType)
    ? PROVIDER_ICON_CONFIG[providerType].Icon
    : getModelsDevLogoIcon(providerType);
