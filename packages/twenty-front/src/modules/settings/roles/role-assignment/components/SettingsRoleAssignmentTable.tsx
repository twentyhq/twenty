import {
  SettingsRoleAssignmentTableRow,
  type RoleTarget,
} from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentTableRow';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';

import { H2Title, IconSearch } from 'twenty-ui/display';
import { type Agent, type ApiKeyForRole } from '~/generated-metadata/graphql';
import { normalizeSearchText } from '~/utils/normalizeSearchText';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledTable = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledTableRows = styled.div`
  gap: ${themeCssVariables.spacing['0.5']};
  padding-block: ${themeCssVariables.spacing[2]};
`;

const StyledSearchContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledSearchInputContainer = styled.div`
  > * input {
    background: ${themeCssVariables.background.transparent.lighter};
    border: 1px solid ${themeCssVariables.border.color.medium};
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
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
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

  const filteredRoleTargets = useMemo(() => {
    if (!searchFilter) return roleTargets;

    const getSearchableFields = (
      roleTarget: PartialWorkspaceMember | Agent | ApiKeyForRole,
    ): string[] => {
      switch (roleTargetType) {
        case 'member': {
          const member = roleTarget as PartialWorkspaceMember;
          return [
            normalizeSearchText(member.name.firstName),
            normalizeSearchText(member.name.lastName),
            normalizeSearchText(member.userEmail),
          ];
        }
        case 'agent': {
          const agent = roleTarget as Agent;
          return [
            normalizeSearchText(agent.name),
            normalizeSearchText(agent.label),
            normalizeSearchText(agent.description),
          ];
        }
        case 'apiKey': {
          const apiKey = roleTarget as ApiKeyForRole;
          return [normalizeSearchText(apiKey.name)];
        }
      }
    };

    const searchTerm = normalizeSearchText(searchFilter);
    return roleTargets.filter((roleTarget) => {
      const searchableFields = getSearchableFields(roleTarget);
      return searchableFields.some((field) => field.includes(searchTerm));
    });
  }, [roleTargets, searchFilter, roleTargetType]);

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
        <StyledSearchInputContainer>
          <SettingsTextInput
            instanceId={`role-assignment-${roleTargetType}-search`}
            value={searchFilter}
            onChange={handleSearchChange}
            placeholder={t`Search an assigned ${roleTargetDisplayName}...`}
            fullWidth
            LeftIcon={IconSearch}
            sizeVariant="lg"
          />
        </StyledSearchInputContainer>
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
            <TableCell color={themeCssVariables.font.color.tertiary}>
              {tableConfig[roleTargetType].emptyStateText}
            </TableCell>
          )}
        </StyledTableRows>
      </StyledTable>
    </>
  );
};
