import {
  currentWorkspaceMemberState,
  type CurrentWorkspaceMember,
} from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersStates';
import { useUpdateAgentRole } from '@/settings/roles/hooks/useUpdateAgentRole';
import { useUpdateApiKeyRole } from '@/settings/roles/hooks/useUpdateApiKeyRole';
import { useUpdateWorkspaceMemberRole } from '@/settings/roles/hooks/useUpdateWorkspaceMemberRole';
import { SettingsRoleAssignmentConfirmationModal } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentConfirmationModal';

import { SettingsRoleAssignmentEntityPickerDropdown } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentEntityPickerDropdown';
import { SettingsRoleAssignmentTable } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentTable';
import { SettingsRoleAssignmentWorkspaceMemberPickerDropdown } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentWorkspaceMemberPickerDropdown';
import { type SettingsRoleAssignmentConfirmationModalSelectedRoleTarget } from '@/settings/roles/role-assignment/types/SettingsRoleAssignmentConfirmationModalSelectedRoleTarget';
import { settingsAllRolesSelector } from '@/settings/roles/states/settingsAllRolesSelector';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { SettingsPath } from '@/types/SettingsPath';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { AppTooltip, IconPlus, TooltipDelay } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import {
  useFindManyAgentsQuery,
  useGetApiKeysQuery,
  type Agent,
  type ApiKey,
  type Role,
  type WorkspaceMember,
} from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { ROLE_ASSIGNMENT_CONFIRMATION_MODAL_ID } from '../constants/RoleAssignmentConfirmationModalId';

const StyledAssignToMemberContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

type SettingsRoleAssignmentProps = {
  roleId: string;
  isCreateMode?: boolean;
};

export const SettingsRoleAssignment = ({
  roleId,
  isCreateMode,
}: SettingsRoleAssignmentProps) => {
  const settingsDraftRole = useRecoilValue(
    settingsDraftRoleFamilyState(roleId),
  );

  const navigateSettings = useNavigateSettings();
  const {
    addWorkspaceMemberToRoleAndUpdateState,
    updateWorkspaceMemberRoleDraftState,
  } = useUpdateWorkspaceMemberRole(roleId);

  const { addAgentToRoleAndUpdateState, updateAgentRoleDraftState } =
    useUpdateAgentRole(roleId);

  const { addApiKeyToRoleAndUpdateState, updateApiKeyRoleDraftState } =
    useUpdateApiKeyRole(roleId);

  const { data: agentsData } = useFindManyAgentsQuery();
  const { data: apiKeysData } = useGetApiKeysQuery();

  const { openModal, closeModal } = useModal();
  const [selectedRoleTarget, setSelectRoleTarget] =
    useState<SettingsRoleAssignmentConfirmationModalSelectedRoleTarget | null>(
      null,
    );

  const dropdownId = 'role-member-select';
  const agentDropdownId = 'role-agent-select';
  const apiKeyDropdownId = 'role-api-key-select';

  const { closeDropdown } = useCloseDropdown();
  const currentWorkspaceMembers = useRecoilValue(currentWorkspaceMembersState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const settingsAllRoles = useRecoilValue(settingsAllRolesSelector);

  const workspaceMemberRoleMap = new Map<
    string,
    { id: string; label: string }
  >();
  const agentRoleMap = new Map<string, { id: string; label: string }>();
  const apiKeyRoleMap = new Map<string, { id: string; label: string }>();

  settingsAllRoles.forEach((role: Role) => {
    role.workspaceMembers.forEach((member: WorkspaceMember) => {
      workspaceMemberRoleMap.set(member.id, { id: role.id, label: role.label });
    });
    role.agents?.forEach((agent: Agent) => {
      agentRoleMap.set(agent.id, { id: role.id, label: role.label });
    });
    role.apiKeys?.forEach((apiKey: ApiKey) => {
      apiKeyRoleMap.set(apiKey.id, { id: role.id, label: role.label });
    });
  });

  const assignedWorkspaceMemberIds = settingsDraftRole.workspaceMembers.map(
    (workspaceMember) => workspaceMember.id,
  );

  const assignableWorkspaceMembers = currentWorkspaceMembers.filter(
    (member) => member.id !== currentWorkspaceMember?.id,
  );

  const allWorkspaceMembersHaveThisRole = assignableWorkspaceMembers.every(
    (member) => assignedWorkspaceMemberIds.includes(member.id),
  );

  const agents = settingsDraftRole.agents || [];

  const assignedAgentIds = agents.map((agent) => agent.id);

  const apiKeys = settingsDraftRole.apiKeys || [];

  const assignedApiKeyIds = apiKeys.map((apiKey) => apiKey.id);

  const handleModalClose = () => {
    setSelectRoleTarget(null);
  };

  const isModalOpened = useRecoilComponentValue(
    isModalOpenedComponentState,
    ROLE_ASSIGNMENT_CONFIRMATION_MODAL_ID,
  );

  const handleConfirm = async () => {
    if (!selectedRoleTarget || !isModalOpened) return;

    if (!isCreateMode) {
      switch (selectedRoleTarget.entityType) {
        case 'workspaceMember':
          await addWorkspaceMemberToRoleAndUpdateState({
            workspaceMemberId: selectedRoleTarget.id,
          });
          break;
        case 'agent':
          await addAgentToRoleAndUpdateState({
            agentId: selectedRoleTarget.id,
          });
          break;
        case 'apiKey':
          await addApiKeyToRoleAndUpdateState({
            apiKeyId: selectedRoleTarget.id,
          });
          break;
      }
    } else {
      switch (selectedRoleTarget.entityType) {
        case 'workspaceMember': {
          const workspaceMember = currentWorkspaceMembers.find(
            (member) => member.id === selectedRoleTarget.id,
          );

          if (!workspaceMember) {
            throw new Error('Workspace member not found');
          }

          updateWorkspaceMemberRoleDraftState({
            workspaceMember: {
              id: workspaceMember.id,
              name: workspaceMember.name,
              colorScheme: '',
              userEmail: '',
            },
          });
          break;
        }
        case 'agent': {
          const agent = agentsData?.findManyAgents.find(
            (agent) => agent.id === selectedRoleTarget.id,
          );

          if (!agent) {
            throw new Error('Agent not found');
          }

          updateAgentRoleDraftState({
            agent,
          });
          break;
        }
        case 'apiKey': {
          const apiKeyData = apiKeysData?.apiKeys.find(
            (apiKey) => apiKey.id === selectedRoleTarget.id,
          );

          if (!apiKeyData) {
            throw new Error('API key not found');
          }

          const apiKey = {
            ...apiKeyData,
            workspaceId: '',
          } as ApiKey;

          updateApiKeyRoleDraftState({
            apiKey,
          });
          break;
        }
      }
    }

    handleModalClose();
  };

  const handleSelectEntity = <
    T extends CurrentWorkspaceMember | Agent | ApiKey,
  >(
    entity: T,
    entityType: 'workspaceMember' | 'agent' | 'apiKey',
  ) => {
    let existingRole: { id: string; label: string } | undefined;
    let name: string;
    let dropdownIdToClose: string;

    switch (entityType) {
      case 'workspaceMember': {
        const workspaceMember = entity as CurrentWorkspaceMember;
        existingRole = workspaceMemberRoleMap.get(workspaceMember.id);
        name = `${workspaceMember.name.firstName} ${workspaceMember.name.lastName}`;
        dropdownIdToClose = dropdownId;
        break;
      }
      case 'agent': {
        const agent = entity as Agent;
        existingRole = agentRoleMap.get(agent.id);
        name = agent.label;
        dropdownIdToClose = agentDropdownId;
        break;
      }
      case 'apiKey': {
        const apiKey = entity as ApiKey;
        existingRole = apiKeyRoleMap.get(apiKey.id);
        name = apiKey.name;
        dropdownIdToClose = apiKeyDropdownId;
        break;
      }
    }

    setSelectRoleTarget({
      id: entity.id,
      name,
      role: existingRole,
      entityType,
    });
    openModal(ROLE_ASSIGNMENT_CONFIRMATION_MODAL_ID);
    closeDropdown(dropdownIdToClose);
  };

  const handleRoleClick = (roleId: string) => {
    navigateSettings(SettingsPath.RoleDetail, { roleId });
    handleModalClose();
    closeModal(ROLE_ASSIGNMENT_CONFIRMATION_MODAL_ID);
  };

  if (!settingsDraftRole) {
    return null;
  }

  return (
    <>
      <Section>
        <SettingsRoleAssignmentTable roleId={roleId} roleTargetType="member" />

        <StyledAssignToMemberContainer>
          <Dropdown
            dropdownId="role-member-select"
            dropdownOffset={{ x: 0, y: 4 }}
            clickableComponent={
              <>
                <div id="assign-member">
                  <Button
                    Icon={IconPlus}
                    title={t`Assign to member`}
                    variant="secondary"
                    size="small"
                    disabled={allWorkspaceMembersHaveThisRole}
                  />
                </div>
                <AppTooltip
                  anchorSelect="#assign-member"
                  content={t`The workspace needs at least one Admin`}
                  delay={TooltipDelay.noDelay}
                  hidden={!allWorkspaceMembersHaveThisRole}
                />
              </>
            }
            dropdownComponents={
              <SettingsRoleAssignmentWorkspaceMemberPickerDropdown
                excludedWorkspaceMemberIds={[
                  ...assignedWorkspaceMemberIds,
                  currentWorkspaceMember?.id,
                ]}
                onSelect={(workspaceMember: CurrentWorkspaceMember) =>
                  handleSelectEntity(workspaceMember, 'workspaceMember')
                }
              />
            }
          />
        </StyledAssignToMemberContainer>
      </Section>

      {settingsDraftRole.canBeAssignedToAgents && (
        <Section>
          <SettingsRoleAssignmentTable roleId={roleId} roleTargetType="agent" />
          <StyledAssignToMemberContainer>
            <Dropdown
              dropdownId={agentDropdownId}
              dropdownOffset={{ x: 0, y: 4 }}
              clickableComponent={
                <Button
                  Icon={IconPlus}
                  title={t`Assign to agent`}
                  variant="secondary"
                  size="small"
                />
              }
              dropdownComponents={
                <SettingsRoleAssignmentEntityPickerDropdown
                  entityType="agent"
                  excludedIds={assignedAgentIds}
                  onSelect={(agent) => handleSelectEntity(agent, 'agent')}
                />
              }
            />
          </StyledAssignToMemberContainer>
        </Section>
      )}

      {settingsDraftRole.canBeAssignedToApiKeys && (
        <Section>
          <SettingsRoleAssignmentTable
            roleId={roleId}
            roleTargetType="apiKey"
          />
          <StyledAssignToMemberContainer>
            <Dropdown
              dropdownId={apiKeyDropdownId}
              dropdownOffset={{ x: 0, y: 4 }}
              clickableComponent={
                <Button
                  Icon={IconPlus}
                  title={t`Assign to API key`}
                  variant="secondary"
                  size="small"
                />
              }
              dropdownComponents={
                <SettingsRoleAssignmentEntityPickerDropdown
                  entityType="apiKey"
                  excludedIds={assignedApiKeyIds}
                  onSelect={(apiKey) => handleSelectEntity(apiKey, 'apiKey')}
                />
              }
            />
          </StyledAssignToMemberContainer>
        </Section>
      )}

      {selectedRoleTarget && (
        <SettingsRoleAssignmentConfirmationModal
          selectedRoleTarget={selectedRoleTarget}
          onClose={handleModalClose}
          onConfirm={handleConfirm}
          onRoleClick={handleRoleClick}
        />
      )}
    </>
  );
};
