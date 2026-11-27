import { type SettingsTabDefinition } from '@/settings/types/SettingsTabDefinition';
import { msg } from '@lingui/core/macro';
import { IconApi, IconApps, IconTerminal2, IconWebhook } from 'twenty-ui/icon';

const TABS_IDS = {
  API: 'api',
  WEBHOOKS: 'webhooks',
  APPS: 'apps',
  CLI: 'cli',
} as const;

export const SETTINGS_DEVELOPERS_TABS = {
  COMPONENT_INSTANCE_ID: 'settings-developers-tabs',
  TABS_IDS,
  TABS: [
    { id: TABS_IDS.API, title: msg`API`, Icon: IconApi },
    { id: TABS_IDS.WEBHOOKS, title: msg`Webhooks`, Icon: IconWebhook },
    { id: TABS_IDS.APPS, title: msg`Apps`, Icon: IconApps },
    { id: TABS_IDS.CLI, title: msg`CLI`, Icon: IconTerminal2 },
  ] satisfies SettingsTabDefinition[],
};
