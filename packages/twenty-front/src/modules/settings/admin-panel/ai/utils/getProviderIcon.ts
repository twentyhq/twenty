import { type IconComponent } from 'twenty-ui/display';

import { PROVIDER_CONFIG } from '@/settings/admin-panel/ai/constants/ProviderConfig';
import { getModelsDevLogoIcon } from '@/settings/admin-panel/ai/utils/getModelsDevLogoIcon';

export const getProviderIcon = (providerType: string): IconComponent => {
  return (
    PROVIDER_CONFIG[providerType]?.Icon ?? getModelsDevLogoIcon(providerType)
  );
};
