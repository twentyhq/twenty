import { type SettingsTabDefinition } from '@/settings/types/SettingsTabDefinition';
import { msg } from '@lingui/core/macro';
import { IconApi, IconApps, IconTerminal2, IconWebhook } from 'twenty-ui/icon';

export const SETTINGS_DEVELOPERS_TABS = {
  COMPONENT_INSTANCE_ID: 'settings-developers-tabs',
  TABS_IDS: {
    API: 'api',
    WEBHOOKS: 'webhooks',
    APPS: 'apps',
    CLI: 'cli',
  } as const,
  TABS: [
    { id: 'api', title: msg`API`, Icon: IconApi },
    { id: 'webhooks', title: msg`Webhooks`, Icon: IconWebhook },
    { id: 'apps', title: msg`Apps`, Icon: IconApps },
    { id: 'cli', title: msg`CLI`, Icon: IconTerminal2 },
  ] satisfies SettingsTabDefinition[],
};
