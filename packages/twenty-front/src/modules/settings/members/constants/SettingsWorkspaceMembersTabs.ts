import { type SettingsTabDefinition } from '@/settings/types/SettingsTabDefinition';
import { msg } from '@lingui/core/macro';
import { IconLock, IconUserPlus, IconUsers } from 'twenty-ui/icon';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const TABS_IDS = {
  TEAM: 'team',
  INVITE: 'invite',
  ROLES: 'roles',
} as const;

export const SETTINGS_WORKSPACE_MEMBERS_TABS = {
  COMPONENT_INSTANCE_ID: 'members-tab-list',
  TABS_IDS,
  TABS: [
    { id: TABS_IDS.TEAM, title: msg`Team`, Icon: IconUsers },
    { id: TABS_IDS.INVITE, title: msg`Invite`, Icon: IconUserPlus },
    {
      id: TABS_IDS.ROLES,
      title: msg`Roles`,
      Icon: IconLock,
      settingsPermission: PermissionFlagType.ROLES,
    },
  ] satisfies SettingsTabDefinition[],
};
