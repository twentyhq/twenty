import { type SettingsTabDefinition } from '@/settings/types/SettingsTabDefinition';
import { SETTINGS_DEVELOPERS_TAB_IDS } from '@/settings/developers/constants/SettingsDevelopersTabIds';
import { msg } from '@lingui/core/macro';
import { IconApi, IconApps, IconTerminal2, IconWebhook } from 'twenty-ui/icon';

export const SETTINGS_DEVELOPERS_TABS = {
  COMPONENT_INSTANCE_ID: 'settings-developers-tabs',
  TABS_IDS: SETTINGS_DEVELOPERS_TAB_IDS,
  TABS: [
    { id: SETTINGS_DEVELOPERS_TAB_IDS.API, title: msg`API`, Icon: IconApi },
    {
      id: SETTINGS_DEVELOPERS_TAB_IDS.WEBHOOKS,
      title: msg`Webhooks`,
      Icon: IconWebhook,
    },
    { id: SETTINGS_DEVELOPERS_TAB_IDS.APPS, title: msg`Apps`, Icon: IconApps },
    {
      id: SETTINGS_DEVELOPERS_TAB_IDS.CLI,
      title: msg`CLI`,
      Icon: IconTerminal2,
    },
  ] satisfies SettingsTabDefinition[],
};
