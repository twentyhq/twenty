import { IconRobot, type IconComponent } from 'twenty-ui/display';

import { PROVIDER_CONFIG } from '@/settings/admin-panel/ai/constants/ProviderConfig';

export const getProviderIcon = (providerType: string): IconComponent => {
  return PROVIDER_CONFIG[providerType]?.Icon ?? IconRobot;
};
