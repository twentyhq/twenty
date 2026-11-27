import { type SettingsTabDefinition } from '@/settings/types/SettingsTabDefinition';
import { msg } from '@lingui/core/macro';
import { IconLock, IconUserPlus, IconUsers } from 'twenty-ui/icon';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const SETTINGS_WORKSPACE_MEMBERS_TABS = {
  COMPONENT_INSTANCE_ID: 'members-tab-list',
  TABS_IDS: {
    TEAM: 'team',
    INVITE: 'invite',
    ROLES: 'roles',
  } as const,
  TABS: [
    { id: 'team', title: msg`Team`, Icon: IconUsers },
    { id: 'invite', title: msg`Invite`, Icon: IconUserPlus },
    {
      id: 'roles',
      title: msg`Roles`,
      Icon: IconLock,
      settingsPermission: PermissionFlagType.ROLES,
    },
  ] satisfies SettingsTabDefinition[],
};
