import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { SETTINGS_DEVELOPERS_TABS } from '@/settings/developers/constants/SettingsDevelopersTabs';

type DeveloperToolsNavigationMenuItem = {
  link: string;
  iconName: string;
  label: MessageDescriptor;
};

export const DEVELOPER_TOOLS_NAVIGATION_MENU_ITEMS: DeveloperToolsNavigationMenuItem[] =
  [
    {
      link: getSettingsPath(
        SettingsPath.Developers,
        undefined,
        undefined,
        SETTINGS_DEVELOPERS_TABS.TABS_IDS.API,
      ),
      iconName: 'IconApi',
      label: msg`API`,
    },
    {
      link: getSettingsPath(
        SettingsPath.Developers,
        undefined,
        undefined,
        SETTINGS_DEVELOPERS_TABS.TABS_IDS.WEBHOOKS,
      ),
      iconName: 'IconWebhook',
      label: msg`Webhooks`,
    },
    {
      link: getSettingsPath(
        SettingsPath.Developers,
        undefined,
        undefined,
        SETTINGS_DEVELOPERS_TABS.TABS_IDS.APPS,
      ),
      iconName: 'IconApps',
      label: msg`Apps`,
    },
    {
      link: getSettingsPath(
        SettingsPath.Developers,
        undefined,
        undefined,
        SETTINGS_DEVELOPERS_TABS.TABS_IDS.CLI,
      ),
      iconName: 'IconTerminal2',
      label: msg`CLI`,
    },
    {
      link: getSettingsPath(SettingsPath.Objects),
      iconName: 'IconHierarchy',
      label: msg`Data model`,
    },
    {
      link: getSettingsPath(SettingsPath.General, undefined, undefined, 'logs'),
      iconName: 'IconHistory',
      label: msg`Logs`,
    },
  ];
