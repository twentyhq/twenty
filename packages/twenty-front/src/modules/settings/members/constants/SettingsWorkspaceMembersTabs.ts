import { type SettingsTabDefinition } from '@/settings/types/SettingsTabDefinition';
import { SETTINGS_WORKSPACE_MEMBERS_TAB_IDS } from '@/settings/members/constants/SettingsWorkspaceMembersTabIds';
import { msg } from '@lingui/core/macro';
import { IconLock, IconUserPlus, IconUsers } from 'twenty-ui/icon';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const SETTINGS_WORKSPACE_MEMBERS_TABS = {
  COMPONENT_INSTANCE_ID: 'members-tab-list',
  TABS_IDS: SETTINGS_WORKSPACE_MEMBERS_TAB_IDS,
  TABS: [
    {
      id: SETTINGS_WORKSPACE_MEMBERS_TAB_IDS.TEAM,
      title: msg`Team`,
      Icon: IconUsers,
    },
    {
      id: SETTINGS_WORKSPACE_MEMBERS_TAB_IDS.INVITE,
      title: msg`Invite`,
      Icon: IconUserPlus,
    },
    {
      id: SETTINGS_WORKSPACE_MEMBERS_TAB_IDS.ROLES,
      title: msg`Roles`,
      Icon: IconLock,
      settingsPermission: PermissionFlagType.ROLES,
    },
  ] satisfies SettingsTabDefinition[],
};
