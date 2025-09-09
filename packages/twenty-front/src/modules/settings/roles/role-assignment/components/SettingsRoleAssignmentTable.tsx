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
import { type Agent } from '~/generated-metadata/graphql';
import { type ApiKeyForRole } from '~/generated/graphql';
import { type PartialWorkspaceMember } from '../../types/RoleWithPartialMembers';

const StyledTable = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledTableRows = styled.div`
  gap: ${({ theme }) => theme.spacing(0.5)};
  padding-block: ${({ theme }) => theme.spacing(2)};
`;

const StyledEmptyState = styled(TableCell)`
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

type RoleTargetType = 'member' | 'agent' | 'apiKey';

type SettingsRoleAssignmentTableProps<T extends RoleTargetType> = {
  roleTargetType: T;
  roleId: string;
};

export const SettingsRoleAssignmentTable = <T extends RoleTargetType>({
  roleTargetType,
  roleId,
}: SettingsRoleAssignmentTableProps<T>) => {
  const settingsDraftRole = useRecoilValue(
    settingsDraftRoleFamilyState(roleId),
  );
  const [searchFilter, setSearchFilter] = useState('');

  const handleSearchChange = (text: string) => {
    setSearchFilter(text);
  };

  const tableConfig = {
    member: {
      columns: [t`Name`, t`Email`],
      displayName: t`Members`,
      emptyStateText: t`No members assigned`,
      roleTargets: settingsDraftRole.workspaceMembers,
    },
    agent: {
      columns: [t`Name`, t`Description`],
      displayName: t`Agents`,
      emptyStateText: t`No agents assigned`,
      roleTargets: settingsDraftRole.agents,
    },
    apiKey: {
      columns: [t`Name`, t`Expires`],
      displayName: t`API keys`,
      emptyStateText: t`No API keys assigned`,
      roleTargets: settingsDraftRole.apiKeys,
    },
  };

  const roleTargetDisplayName = tableConfig[roleTargetType].displayName;

  const roleTargets = tableConfig[roleTargetType].roleTargets;

  const getSearchableFields = (
    roleTarget: PartialWorkspaceMember | Agent | ApiKeyForRole,
  ): string[] => {
    switch (roleTargetType) {
      case 'member': {
        const member = roleTarget as PartialWorkspaceMember;
        return [
          member.name.firstName?.toLowerCase() || '',
          member.name.lastName?.toLowerCase() || '',
          member.userEmail?.toLowerCase() || '',
        ];
      }
      case 'agent': {
        const agent = roleTarget as Agent;
        return [
          agent.name?.toLowerCase() || '',
          agent.label?.toLowerCase() || '',
          agent.description?.toLowerCase() || '',
        ];
      }
      case 'apiKey': {
        const apiKey = roleTarget as ApiKeyForRole;
        return [apiKey.name?.toLowerCase() || ''];
      }
    }
  };

  const filteredRoleTargets = !searchFilter
    ? roleTargets
    : roleTargets.filter((roleTarget) => {
        const searchTerm = searchFilter.toLowerCase();
        const searchableFields = getSearchableFields(roleTarget);
        return searchableFields.some((field) => field.includes(searchTerm));
      });

  const createRoleTarget = (
    roleTarget: PartialWorkspaceMember | Agent | ApiKeyForRole,
  ): RoleTarget => {
    switch (roleTargetType) {
      case 'member':
        return {
          type: roleTargetType,
          data: roleTarget as PartialWorkspaceMember,
        };
      case 'agent':
        return { type: roleTargetType, data: roleTarget as Agent };
      case 'apiKey':
        return { type: roleTargetType, data: roleTarget as ApiKeyForRole };
    }
  };

  return (
    <>
      <H2Title
        title={t`Assigned ${roleTargetDisplayName}`}
        description={t`This role is assigned to these ${roleTargetDisplayName}.`}
      />
      <StyledSearchContainer>
        <StyledSearchInput
          instanceId={`role-assignment-${roleTargetType}-search`}
          value={searchFilter}
          onChange={handleSearchChange}
          placeholder={t`Search an assigned ${roleTargetDisplayName}...`}
          fullWidth
          LeftIcon={IconSearch}
          sizeVariant="lg"
        />
      </StyledSearchContainer>
      <StyledTable>
        <TableRow gridAutoColumns="2fr 4fr">
          {tableConfig[roleTargetType].columns.map((column) => (
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

          {filteredRoleTargets.length === 0 && (
            <StyledEmptyState>
              {tableConfig[roleTargetType].emptyStateText}
            </StyledEmptyState>
          )}
        </StyledTableRows>
      </StyledTable>
    </>
  );
};
