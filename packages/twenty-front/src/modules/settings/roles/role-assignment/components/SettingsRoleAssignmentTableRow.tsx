import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { UserContext } from '@/users/contexts/UserContext';
import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import {
  Avatar,
  IconKey,
  OverflowingTextWithTooltip,
  useIcons,
} from 'twenty-ui/display';
import { type Agent } from '~/generated-metadata/graphql';
import { type ApiKeyForRole } from '~/generated/graphql';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { formatDateString } from '~/utils/string/formatDateString';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';

const StyledIconWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
`;

const StyledNameCell = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  flex: 1;
  min-width: 0;
`;

const StyledNameContainer = styled.div`
  align-items: center;
  display: flex;
  overflow: hidden;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledTableCell = styled(TableCell)`
  overflow: hidden;
`;

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
  const theme = useTheme();
  const currentWorkspaceMembers = useRecoilValue(currentWorkspaceMembersState);
  const { getIcon } = useIcons();
  const { dateFormat, timeZone } = useContext(UserContext);
  const dateLocale = useRecoilValue(dateLocaleState);

  const renderIcon = () => {
    switch (roleTarget.type) {
      case 'member': {
        const enrichedWorkspaceMember = currentWorkspaceMembers.find(
          (member) => member.id === roleTarget.data.id,
        );
        return (
          <Avatar
            avatarUrl={enrichedWorkspaceMember?.avatarUrl}
            placeholderColorSeed={enrichedWorkspaceMember?.id}
            placeholder={enrichedWorkspaceMember?.name.firstName ?? ''}
            type="rounded"
            size="md"
          />
        );
      }
      case 'agent': {
        const Icon = getIcon(roleTarget.data.icon || 'IconRobot');
        return <Icon size={theme.icon.size.md} />;
      }
      case 'apiKey': {
        return <IconKey size={theme.icon.size.md} />;
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
      <StyledTableCell>
        <StyledNameContainer>
          <StyledIconWrapper>{renderIcon()}</StyledIconWrapper>
          <StyledNameCell>
            <OverflowingTextWithTooltip text={renderName()} />
          </StyledNameCell>
        </StyledNameContainer>
      </StyledTableCell>
      <StyledTableCell>
        <OverflowingTextWithTooltip text={renderSecondaryInfo()} />
      </StyledTableCell>
    </TableRow>
  );
};
