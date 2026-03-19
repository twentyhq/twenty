import { IconRobot, type IconComponent } from 'twenty-ui/display';

import { PROVIDER_ICON_CONFIG } from '@/settings/admin-panel/ai/constants/ProviderIconConfig';

export const getProviderIcon = (providerType: string): IconComponent => {
  return PROVIDER_ICON_CONFIG[providerType] ?? IconRobot;
};
