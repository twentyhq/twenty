import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components';
import { IconLock, IconX, useIcons } from 'twenty-ui/icon';
import { MenuItem } from 'twenty-ui/primitives/navigation';

import { useChatChannelActions } from '@/ai/hooks/useChatChannelActions';
import { useChatChannelAssignableRoles } from '@/ai/hooks/useChatChannelAssignableRoles';
import { useChatChannels } from '@/ai/hooks/useChatChannels';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';

type AiChatChannelRolesSectionProps = {
  channelId: string;
};

// Everyone holding a granted role reads the channel like a member.
export const AiChatChannelRolesSection = ({
  channelId,
}: AiChatChannelRolesSectionProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { getChannelRoles, isCurrentUserChannelAdmin } = useChatChannels();
  const { assignableRoles } = useChatChannelAssignableRoles();
  const { addChatChannelRole, removeChatChannelRole } = useChatChannelActions();

  const channelRoles = getChannelRoles(channelId);
  const isAdmin = isCurrentUserChannelAdmin(channelId);
  const grantedRoleIds = new Set(
    channelRoles.map((channelRole) => channelRole.roleId),
  );
  const grantableRoles = assignableRoles.filter(
    (role) => !grantedRoleIds.has(role.id),
  );

  if (channelRoles.length === 0 && !isAdmin) {
    return null;
  }

  const getRoleIcon = (icon: string | null | undefined) =>
    isDefined(icon) ? getIcon(icon) : IconLock;

  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuHeader>{t`Roles`}</DropdownMenuHeader>
      <DropdownMenuItemsContainer hasMaxHeight>
        {channelRoles.length === 0 ? (
          <MenuItem disabled text={t`No role has access yet`} />
        ) : (
          channelRoles.map((channelRole) => {
            const role = assignableRoles.find(
              (candidate) => candidate.id === channelRole.roleId,
            );
            const label = role?.label ?? t`Role`;

            return (
              <MenuItem
                key={channelRole.id}
                LeftIcon={getRoleIcon(role?.icon)}
                text={label}
                iconButtons={
                  isAdmin ? (
                    <LightIconButton
                      aria-label={t`Remove ${label}`}
                      onClick={() =>
                        removeChatChannelRole({
                          channelId,
                          roleId: channelRole.roleId,
                        })
                      }
                    >
                      <IconX />
                    </LightIconButton>
                  ) : undefined
                }
              />
            );
          })
        )}
      </DropdownMenuItemsContainer>
      {isAdmin && grantableRoles.length > 0 && (
        <>
          <DropdownMenuHeader>{t`Give access to a role`}</DropdownMenuHeader>
          <DropdownMenuItemsContainer hasMaxHeight>
            {grantableRoles.map((role) => (
              <MenuItem
                key={role.id}
                LeftIcon={getRoleIcon(role.icon)}
                text={role.label}
                onClick={() =>
                  addChatChannelRole({ channelId, roleId: role.id })
                }
              />
            ))}
          </DropdownMenuItemsContainer>
        </>
      )}
    </>
  );
};
