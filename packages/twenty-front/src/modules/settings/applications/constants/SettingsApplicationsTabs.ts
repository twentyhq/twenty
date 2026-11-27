import { type SettingsTabDefinition } from '@/settings/types/SettingsTabDefinition';
import { msg } from '@lingui/core/macro';
import { IconApps, IconShoppingBag } from 'twenty-ui/icon';

export const SETTINGS_APPLICATIONS_TABS = {
  COMPONENT_INSTANCE_ID: 'applications-tab-list',
  TABS_IDS: {
    MARKETPLACE: 'marketplace',
    INSTALLED: 'installed',
  } as const,
  TABS: [
    {
      id: 'marketplace',
      title: msg`Marketplace`,
      Icon: IconShoppingBag,
      pill: msg`Beta`,
    },
    { id: 'installed', title: msg`Installed`, Icon: IconApps },
  ] satisfies SettingsTabDefinition[],
};
