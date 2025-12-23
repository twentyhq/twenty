import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { GET_ROLES } from '@/settings/roles/graphql/queries/getRolesQuery';
import { SettingsRolePermissions } from '@/settings/roles/role-permissions/components/SettingsRolePermissions';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { H2Title, IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import {
  useAssignRoleToAgentMutation,
  useCreateOneRoleMutation,
  useGetRolesQuery,
} from '~/generated-metadata/graphql';
import { type SettingsAIAgentFormValues } from '~/pages/settings/ai/hooks/useSettingsAgentFormState';

const StyledWarningText = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

type SettingsAgentRoleTabProps = {
  formValues: SettingsAIAgentFormValues;
  onFieldChange: (
    field: keyof SettingsAIAgentFormValues,
    value: SettingsAIAgentFormValues[keyof SettingsAIAgentFormValues],
  ) => void;
  disabled: boolean;
  agentId?: string;
  agentLabel: string;
};

export const SettingsAgentRoleTab = ({
  formValues,
  onFieldChange,
  disabled,
  agentId,
  agentLabel,
}: SettingsAgentRoleTabProps) => {
  const { t } = useLingui();
  const [isCreatingRole, setIsCreatingRole] = useState(false);

  const { data: rolesData } = useGetRolesQuery();
  const [createRole] = useCreateOneRoleMutation();
  const [assignRoleToAgent] = useAssignRoleToAgentMutation();
  const setSettingsDraftRole = useSetRecoilState(
    settingsDraftRoleFamilyState(formValues.role || ''),
  );

  const selectedRole = rolesData?.getRoles?.find(
    (role) => role.id === formValues.role,
  );

  const hasValidAgentId = isNonEmptyString(agentId);

  const isRoleShared = selectedRole
    ? (selectedRole.workspaceMembers?.length || 0) +
        (selectedRole.agents?.length || 0) +
        (selectedRole.apiKeys?.length || 0) >
      1
    : false;

  // Role is only editable if it's not shared and either:
  // 1. Assigned exclusively to this agent (edit mode)
  // 2. Not yet assigned to anyone (create mode)
  const isRoleExclusiveToThisAgent =
    !isRoleShared &&
    selectedRole &&
    (selectedRole.workspaceMembers?.length || 0) === 0 &&
    (selectedRole.apiKeys?.length || 0) === 0 &&
    (hasValidAgentId
      ? selectedRole.agents?.length === 1 &&
        selectedRole.agents[0].id === agentId
      : (selectedRole.agents?.length || 0) === 0);

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
        });
      }
    } finally {
      setIsCreatingRole(false);
    }
  };

  const isRoleEditable =
    Boolean(selectedRole?.isEditable) &&
    !disabled &&
    Boolean(isRoleExclusiveToThisAgent);

  return (
    <Section>
      {!formValues.role ? (
        <>
          <H2Title
            title={t`Role`}
            description={t`Create a role to define permissions for this agent.`}
          />
          <Button
            Icon={IconPlus}
            title={t`Create Role`}
            variant="secondary"
            onClick={handleCreateRole}
            disabled={disabled || isCreatingRole}
          />
        </>
      ) : (
        <>
          {selectedRole?.id && (
            <>
              {isRoleShared && (
                <StyledWarningText>
                  {t`This role is shared with other users or agents and cannot be edited here.`}
                </StyledWarningText>
              )}
              <SettingsRolePermissions
                roleId={selectedRole.id}
                isEditable={isRoleEditable}
                fromAgentId={hasValidAgentId ? agentId : undefined}
              />
            </>
          )}
        </>
      )}
    </Section>
  );
};
