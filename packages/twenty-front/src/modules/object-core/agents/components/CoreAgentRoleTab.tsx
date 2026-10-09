import { getOperationName } from '~/utils/getOperationName';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { v4 } from 'uuid';

import { GET_ROLES } from '@/settings/roles/graphql/queries/getRolesQuery';
import { SettingsRolePermissions } from '@/settings/roles/role-permissions/components/SettingsRolePermissions';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { useMutation } from '@apollo/client/react';
import {
  AssignRoleToAgentDocument,
  CreateOneRoleDocument,
} from '~/generated-metadata/graphql';
import { type CoreAgentFormValues } from '@/object-core/agents/validation-schemas/coreAgentFormSchema';

const StyledWarningText = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

type CoreAgentRoleTabProps = {
  formValues: CoreAgentFormValues;
  onFieldChange: (
    field: keyof CoreAgentFormValues,
    value: CoreAgentFormValues[keyof CoreAgentFormValues],
  ) => void;
  disabled: boolean;
  agentId?: string;
  agentLabel: string;
};

export const CoreAgentRoleTab = ({
  formValues,
  onFieldChange,
  disabled,
  agentId,
  agentLabel,
}: CoreAgentRoleTabProps) => {
  const { t } = useLingui();
  const [isCreatingRole, setIsCreatingRole] = useState(false);

  const settingsPersistedRole = useAtomFamilyStateValue(
    settingsPersistedRoleFamilyState,
    formValues.role || '',
  );
  const [createRole] = useMutation(CreateOneRoleDocument);
  const [assignRoleToAgent] = useMutation(AssignRoleToAgentDocument);
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    formValues.role || '',
  );

  const hasValidAgentId = isNonEmptyString(agentId);

  const isRoleShared = settingsPersistedRole
    ? (settingsPersistedRole.workspaceMembers?.length || 0) +
        (settingsPersistedRole.agents?.length || 0) +
        (settingsPersistedRole.apiKeys?.length || 0) >
      1
    : false;

  const isRoleExclusiveToThisAgent =
    !isRoleShared &&
    settingsPersistedRole &&
    (settingsPersistedRole.workspaceMembers?.length || 0) === 0 &&
    (settingsPersistedRole.apiKeys?.length || 0) === 0 &&
    (hasValidAgentId
      ? settingsPersistedRole.agents?.length === 1 &&
        settingsPersistedRole.agents[0].id === agentId
      : (settingsPersistedRole.agents?.length || 0) === 0);

  const handleCreateRole = async () => {
    setIsCreatingRole(true);
    try {
      const roleId = v4();
      const roleName = t`${agentLabel} Agent Role`;

      const { data } = await createRole({
        variables: {
          createRoleInput: {
            id: roleId,
            label: roleName,
            description: t`Role for ${agentLabel} agent`,
            icon: 'IconLock',
            canUpdateAllSettings: false,
            canAccessAllTools: false,
            canReadAllObjectRecords: false,
            canUpdateAllObjectRecords: false,
            canSoftDeleteAllObjectRecords: false,
            canDestroyAllObjectRecords: false,
            canBeAssignedToUsers: false,
            canBeAssignedToAgents: true,
            canBeAssignedToApiKeys: false,
          },
        },
        refetchQueries: [getOperationName(GET_ROLES) ?? ''],
      });

      if (isDefined(data?.createOneRole)) {
        onFieldChange('role', data.createOneRole.id);

        if (hasValidAgentId) {
          await assignRoleToAgent({
            variables: {
              agentId,
              roleId: data.createOneRole.id,
            },
            refetchQueries: ['GetRoles'],
          });
        }

        setSettingsDraftRole({
          ...data.createOneRole,
          workspaceMembers: [],
          agents: [],
          apiKeys: [],
          objectPermissions: [],
          fieldPermissions: [],
          permissionFlags: [],
          rowLevelPermissionPredicateGroups: [],
          rowLevelPermissionPredicates: [],
        });
      }
    } finally {
      setIsCreatingRole(false);
    }
  };

  const isRoleEditable =
    Boolean(settingsPersistedRole?.isEditable) &&
    !disabled &&
    Boolean(isRoleExclusiveToThisAgent);

  return (
    <Section.Root>
      {!formValues.role ? (
        <>
          <Section.Header
            title={t`Role`}
            description={t`Create a role to define permissions for this agent.`}
          />
          <Button
            startIcon={<IconPlus />}
            onClick={handleCreateRole}
            disabled={disabled || isCreatingRole}
            variant="outline"
          >{t`Create Role`}</Button>
        </>
      ) : (
        <>
          {settingsPersistedRole?.id && (
            <>
              {isRoleShared && (
                <StyledWarningText>
                  {t`This role is shared with other users or agents and cannot be edited here.`}
                </StyledWarningText>
              )}
              <SettingsRolePermissions
                roleId={settingsPersistedRole.id}
                isEditable={isRoleEditable}
                fromAgentId={hasValidAgentId ? agentId : undefined}
              />
            </>
          )}
        </>
      )}
    </Section.Root>
  );
};
