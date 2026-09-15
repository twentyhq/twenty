import { SettingsTableFirstColumn } from '@/settings/components/SettingsTableFirstColumn';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
import { t } from '@lingui/core/macro';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { Avatar } from 'twenty-ui/data-display';
import { IconKey, useIcons } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { type Agent, type ApiKeyForRole } from '~/generated-metadata/graphql';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';
import { formatDateString } from '~/utils/string/formatDateString';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

export type RoleTarget =
  | { type: 'member'; data: PartialWorkspaceMember }
  | { type: 'agent'; data: Agent }
  | { type: 'apiKey'; data: ApiKeyForRole };

type SettingsRoleAssignmentTableRowProps = {
  roleTarget: RoleTarget;
};

export const SettingsRoleAssignmentTableRow = ({
  roleTarget,
}: SettingsRoleAssignmentTableRowProps) => {
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();
  const { dateFormat, timeZone } = useContext(UserContext);
  const dateLocale = useAtomStateValue(dateLocaleState);

  const renderIcon = () => {
    switch (roleTarget.type) {
      case 'member': {
        const enrichedWorkspaceMember = currentWorkspaceMembers.find(
          (member) => member.id === roleTarget.data.id,
        );
        return (
          <Avatar
            src={getAbsoluteImageUrl(enrichedWorkspaceMember?.avatarUrl)}
            colorSeed={enrichedWorkspaceMember?.id}
            name={enrichedWorkspaceMember?.name.firstName ?? ''}
            shape="circle"
            size="md"
          />
        );
      }
      case 'agent': {
        const Icon = getIcon(roleTarget.data.icon || 'IconLego');
        return <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />;
      }
      case 'apiKey': {
        return (
          <IconKey size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        );
      }
    }
  };

  const renderName = () => {
    switch (roleTarget.type) {
      case 'member':
        return `${roleTarget.data.name.firstName} ${roleTarget.data.name.lastName}`;
      case 'agent':
        return roleTarget.data.label;
      case 'apiKey':
        return roleTarget.data.name;
    }
  };

  const renderSecondaryInfo = () => {
    switch (roleTarget.type) {
      case 'member':
        return roleTarget.data.userEmail;
      case 'agent':
        return roleTarget.data.description;
      case 'apiKey':
        return roleTarget.data.expiresAt
          ? formatDateString({
              value: roleTarget.data.expiresAt,
              timeZone,
              dateFormat,
              localeCatalog: dateLocale.localeCatalog,
            })
          : t`Never expires`;
    }
  };

  return (
    <TableRow gridAutoColumns="2fr 4fr">
      <TableCell overflow="hidden">
        <SettingsTableFirstColumn
          label={renderName()}
          leadingContent={renderIcon()}
        />
      </TableCell>
      <TableCell overflow="hidden">
        <OverflowingTextWithTooltip text={renderSecondaryInfo()} />
      </TableCell>
    </TableRow>
  );
};
