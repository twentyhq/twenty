import { type SettingsTabDefinition } from '@/settings/types/SettingsTabDefinition';
import { SETTINGS_APPLICATIONS_TAB_IDS } from '@/settings/applications/constants/SettingsApplicationsTabIds';
import { msg } from '@lingui/core/macro';
import { IconApps, IconShoppingBag } from 'twenty-ui/icon';

export const SETTINGS_APPLICATIONS_TABS = {
  COMPONENT_INSTANCE_ID: 'applications-tab-list',
  TABS_IDS: SETTINGS_APPLICATIONS_TAB_IDS,
  TABS: [
    {
      id: SETTINGS_APPLICATIONS_TAB_IDS.MARKETPLACE,
      title: msg`Marketplace`,
      Icon: IconShoppingBag,
      pill: msg`Beta`,
    },
    {
      id: SETTINGS_APPLICATIONS_TAB_IDS.INSTALLED,
      title: msg`Installed`,
      Icon: IconApps,
    },
  ] satisfies SettingsTabDefinition[],
};
