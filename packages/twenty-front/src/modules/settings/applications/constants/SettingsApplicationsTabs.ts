import { type SettingsTabDefinition } from '@/settings/types/SettingsTabDefinition';
import { msg } from '@lingui/core/macro';
import { IconApps, IconShoppingBag } from 'twenty-ui/icon';

const TABS_IDS = {
  MARKETPLACE: 'marketplace',
  INSTALLED: 'installed',
} as const;

export const SETTINGS_APPLICATIONS_TABS = {
  COMPONENT_INSTANCE_ID: 'applications-tab-list',
  TABS_IDS,
  TABS: [
    {
      id: TABS_IDS.MARKETPLACE,
      title: msg`Marketplace`,
      Icon: IconShoppingBag,
      pill: msg`Beta`,
    },
    { id: TABS_IDS.INSTALLED, title: msg`Installed`, Icon: IconApps },
  ] satisfies SettingsTabDefinition[],
};
