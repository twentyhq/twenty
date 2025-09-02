import {
  SettingsRoleAssignmentTableRow,
  type RoleTarget,
} from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentTableRow';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';

import { H2Title, IconSearch } from 'twenty-ui/display';
import {
  type Agent,
  type ApiKey,
  type WorkspaceMember,
} from '~/generated-metadata/graphql';
import { type ApiKeyForRole } from '~/generated/graphql';

const StyledTable = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledTableRows = styled.div`
  gap: ${({ theme }) => theme.spacing(0.5)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

type RoleTargetType = 'member' | 'agent' | 'apiKey';

const StyledNoMembers = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledSearchContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledSearchInput = styled(SettingsTextInput)`
  input {
    background: ${({ theme }) => theme.background.transparent.lighter};
    border: 1px solid ${({ theme }) => theme.border.color.medium};
  }
`;

type SettingsRoleAssignmentTableProps<T extends RoleTargetType> = {
  roleTargetType: T;
  roleId: string;
  emptyText?: string;
};

export const SettingsRoleAssignmentTable = <T extends RoleTargetType>({
  roleTargetType,
  roleId,
  emptyText,
}: SettingsRoleAssignmentTableProps<T>) => {
  const settingsDraftRole = useRecoilValue(
    settingsDraftRoleFamilyState(roleId),
  );
  const [searchFilter, setSearchFilter] = useState('');

  const handleSearchChange = (text: string) => {
    setSearchFilter(text);
  };

  const tableColumns: Record<RoleTargetType, [string, string]> = {
    member: [t`Name`, t`Email`],
    agent: [t`Name`, t`Description`],
    apiKey: [t`Name`, t`Expires`],
  };

  const roleTargetLabels: Record<RoleTargetType, string> = {
    member: 'members',
    agent: 'agents',
    apiKey: 'API keys',
  };

  const roleTargetLabel = roleTargetLabels[roleTargetType];

  const defaultEmptyText: Record<RoleTargetType, string> = {
    member: t`No members assigned`,
    agent: t`No agents assigned`,
    apiKey: t`No API keys assigned`,
  };

  const roleTargets =
    roleTargetType === 'member'
      ? settingsDraftRole.workspaceMembers
      : roleTargetType === 'agent'
        ? settingsDraftRole.agents
        : settingsDraftRole.apiKeys;

  const filteredRoleTargets = !searchFilter
    ? roleTargets
    : roleTargets.filter((roleTarget) => {
        const searchTerm = searchFilter.toLowerCase();

        if (roleTargetType === 'member') {
          const member = roleTarget as WorkspaceMember;
          const firstName = member.name.firstName?.toLowerCase() || '';
          const lastName = member.name.lastName?.toLowerCase() || '';
          const email = member.userEmail?.toLowerCase() || '';
          return (
            firstName.includes(searchTerm) ||
            lastName.includes(searchTerm) ||
            email.includes(searchTerm)
          );
        }

        if (roleTargetType === 'agent') {
          const agent = roleTarget as Agent;
          const name = agent.name?.toLowerCase() || '';
          const label = agent.label?.toLowerCase() || '';
          const description = agent.description?.toLowerCase() || '';
          return (
            name.includes(searchTerm) ||
            label.includes(searchTerm) ||
            description.includes(searchTerm)
          );
        }

        if (roleTargetType === 'apiKey') {
          const apiKey = roleTarget as ApiKey;
          const name = apiKey.name?.toLowerCase() || '';
          return name.includes(searchTerm);
        }

        return false;
      });

  const createRoleTarget = (
    roleTarget: WorkspaceMember | Agent | ApiKeyForRole,
  ): RoleTarget => {
    switch (roleTargetType) {
      case 'member':
        return { type: roleTargetType, data: roleTarget as WorkspaceMember };
      case 'agent':
        return { type: roleTargetType, data: roleTarget as Agent };
      case 'apiKey':
        return { type: roleTargetType, data: roleTarget as ApiKeyForRole };
    }
  };

  return (
    <>
      <H2Title
        title={t`Assigned ${roleTargetLabel}`}
        description={t`This role is assigned to these ${roleTargetLabel}.`}
      />
      <StyledSearchContainer>
        <StyledSearchInput
          instanceId="role-assignment-member-search"
          value={searchFilter}
          onChange={handleSearchChange}
          placeholder={t`Search an assigned ${roleTargetLabel}...`}
          fullWidth
          LeftIcon={IconSearch}
          sizeVariant="lg"
        />
      </StyledSearchContainer>
      <StyledTable>
        <TableRow gridAutoColumns="2fr 4fr">
          {tableColumns[roleTargetType].map((column) => (
            <TableHeader key={column}>{column}</TableHeader>
          ))}
        </TableRow>
        <StyledTableRows>
          {filteredRoleTargets.map((roleTarget) => (
            <SettingsRoleAssignmentTableRow
              key={roleTarget.id}
              roleTarget={createRoleTarget(roleTarget)}
            />
          ))}

          {roleTargets.length === 0 && (
            <StyledNoMembers>
              {emptyText ?? defaultEmptyText[roleTargetType]}
            </StyledNoMembers>
          )}
        </StyledTableRows>
      </StyledTable>
    </>
  );
};
