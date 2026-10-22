import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';

import { SETTINGS_AI_TABS } from '@/settings/ai/constants/SettingsAiTabs';
import { SETTINGS_DEVELOPERS_TABS } from '@/settings/developers/constants/SettingsDevelopersTabs';

type SettingsNavigationMenuPageTab = {
  id: string;
  iconName: string;
  label: MessageDescriptor;
};

type SettingsNavigationMenuPage = {
  iconName: string;
  tabs?: SettingsNavigationMenuPageTab[];
};

export const SETTINGS_NAVIGATION_MENU_PAGES: Partial<
  Record<SettingsPath, SettingsNavigationMenuPage>
> = {
  [SettingsPath.ProfilePage]: { iconName: 'IconUserCircle' },
  [SettingsPath.Experience]: { iconName: 'IconColorSwatch' },
  [SettingsPath.Accounts]: { iconName: 'IconAt' },
  [SettingsPath.AccountsEmails]: { iconName: 'IconMail' },
  [SettingsPath.AccountsCalendars]: { iconName: 'IconCalendarEvent' },
  [SettingsPath.General]: {
    iconName: 'IconSettings2',
    tabs: [
      { id: 'general', iconName: 'IconSettings2', label: msg`General` },
      { id: 'security', iconName: 'IconKey', label: msg`Security` },
      { id: 'logs', iconName: 'IconHistory', label: msg`Logs` },
    ],
  },
  [SettingsPath.Objects]: { iconName: 'IconHierarchy' },
  [SettingsPath.Layout]: { iconName: 'IconAppWindow' },
  [SettingsPath.WorkspaceMembersPage]: {
    iconName: 'IconUsers',
    tabs: [
      { id: 'team', iconName: 'IconUsers', label: msg`Team` },
      { id: 'invite', iconName: 'IconUserPlus', label: msg`Invite` },
      { id: 'roles', iconName: 'IconLock', label: msg`Roles` },
    ],
  },
  [SettingsPath.Billing]: { iconName: 'IconCreditCard' },
  [SettingsPath.Developers]: {
    iconName: 'IconCode',
    tabs: [
      {
        id: SETTINGS_DEVELOPERS_TABS.TABS_IDS.API,
        iconName: 'IconApi',
        label: msg`API`,
      },
      {
        id: SETTINGS_DEVELOPERS_TABS.TABS_IDS.WEBHOOKS,
        iconName: 'IconWebhook',
        label: msg`Webhooks`,
      },
      {
        id: SETTINGS_DEVELOPERS_TABS.TABS_IDS.APPS,
        iconName: 'IconApps',
        label: msg`Apps`,
      },
      {
        id: SETTINGS_DEVELOPERS_TABS.TABS_IDS.CLI,
        iconName: 'IconTerminal2',
        label: msg`CLI`,
      },
    ],
  },
  [SettingsPath.Applications]: {
    iconName: 'IconApps',
    tabs: [
      {
        id: 'marketplace',
        iconName: 'IconShoppingBag',
        label: msg`Marketplace`,
      },
      { id: 'installed', iconName: 'IconApps', label: msg`Installed` },
    ],
  },
  [SettingsPath.AI]: {
    iconName: 'IconSparkles',
    tabs: [
      {
        id: SETTINGS_AI_TABS.TABS_IDS.MCP,
        iconName: 'IconSparkles',
        label: msg`MCP`,
      },
      {
        id: SETTINGS_AI_TABS.TABS_IDS.MODELS,
        iconName: 'IconCpu',
        label: msg`Models`,
      },
      {
        id: SETTINGS_AI_TABS.TABS_IDS.SKILLS,
        iconName: 'IconBook',
        label: msg`Skills`,
      },
      {
        id: SETTINGS_AI_TABS.TABS_IDS.TOOLS,
        iconName: 'IconTool',
        label: msg`Tools`,
      },
      {
        id: SETTINGS_AI_TABS.TABS_IDS.USAGE,
        iconName: 'IconChartBar',
        label: msg`Usage`,
      },
    ],
  },
  [SettingsPath.WorkspaceCommunications]: { iconName: 'IconMessageCircle' },
  [SettingsPath.AdminPanel]: { iconName: 'IconServer' },
  [SettingsPath.Community]: { iconName: 'IconUsers' },
};
