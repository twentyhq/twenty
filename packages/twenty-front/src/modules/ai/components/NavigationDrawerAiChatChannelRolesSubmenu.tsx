import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconLock, useIcons } from 'twenty-ui/icon';

import { GetAgentChatChannelRolesDocument } from '~/generated-metadata/graphql';

type NavigationDrawerAiChatChannelRolesSubmenuProps = {
  roleIds: string[];
  onChange: (roleIds: string[]) => void;
};

// Roles with access to all channels read it either way, so they stay checked
export const NavigationDrawerAiChatChannelRolesSubmenu = ({
  roleIds,
  onChange,
}: NavigationDrawerAiChatChannelRolesSubmenuProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { data, loading } = useQuery(GetAgentChatChannelRolesDocument, {
    fetchPolicy: 'cache-and-network',
  });
  const roles = data?.agentChatChannelRoles ?? [];
  // Kept here so quick toggles build on each other before the list reloads
  const [checkedRoleIds, setCheckedRoleIds] = useState(roleIds);

  const toggleRole = (roleId: string) => {
    const nextRoleIds = checkedRoleIds.includes(roleId)
      ? checkedRoleIds.filter((checkedRoleId) => checkedRoleId !== roleId)
      : [...checkedRoleIds, roleId];

    setCheckedRoleIds(nextRoleIds);
    onChange(nextRoleIds);
  };

  return (
    <Dropdown.Submenu>
      <Dropdown.SubmenuTrigger startIcon={<IconLock />}>
        {t`Roles`}
      </Dropdown.SubmenuTrigger>
      <Dropdown.Content aria-label={t`Roles in this channel`}>
        <Dropdown.Section label={t`Roles in this channel`} scrollable>
          {roles.length === 0 &&
            (loading ? (
              <Dropdown.Loading>{t`Loading roles`}</Dropdown.Loading>
            ) : (
              <Dropdown.Empty>{t`No roles`}</Dropdown.Empty>
            ))}
          {roles.map((role) => {
            const RoleIcon = getIcon(role.icon ?? 'IconLock');

            return (
              <Dropdown.OptionItem
                key={role.id}
                startIcon={<RoleIcon />}
                selected={
                  role.canAccessAllAgentChatChannels ||
                  checkedRoleIds.includes(role.id)
                }
                disabled={role.canAccessAllAgentChatChannels}
                description={
                  role.canAccessAllAgentChatChannels
                    ? t`All channels`
                    : undefined
                }
                descriptionPlacement="end"
                closeOnSelect={false}
                indicator="checkbox"
                onSelect={() => toggleRole(role.id)}
              >
                {role.label}
              </Dropdown.OptionItem>
            );
          })}
        </Dropdown.Section>
      </Dropdown.Content>
    </Dropdown.Submenu>
  );
};
