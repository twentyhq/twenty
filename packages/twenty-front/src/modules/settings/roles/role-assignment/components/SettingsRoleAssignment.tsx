import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useUpdateAgentRole } from '@/settings/roles/hooks/useUpdateAgentRole';
import { useUpdateApiKeyRole } from '@/settings/roles/hooks/useUpdateApiKeyRole';
import { useUpdateWorkspaceMemberRole } from '@/settings/roles/hooks/useUpdateWorkspaceMemberRole';
import { RoleAssignmentSection } from '@/settings/roles/role-assignment/components/RoleAssignmentSection';
import { SettingsRoleAssignmentConfirmationModal } from '@/settings/roles/role-assignment/components/SettingsRoleAssignmentConfirmationModal';
import { type SettingsRoleAssignmentConfirmationModalSelectedRoleTarget } from '@/settings/roles/role-assignment/types/SettingsRoleAssignmentConfirmationModalSelectedRoleTarget';
import { settingsAllRolesSelector } from '@/settings/roles/states/settingsAllRolesSelector';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import {
  useFindManyAgentsQuery,
  useGetApiKeysQuery,
  type Agent,
} from '~/generated-metadata/graphql';
import { FeatureFlagKey, type ApiKeyForRole } from '~/generated/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { ROLE_ASSIGNMENT_CONFIRMATION_MODAL_ID } from '@/settings/roles/role-assignment/constants/RoleAssignmentConfirmationModalId';
import { ROLE_TARGET_CONFIG } from '@/settings/roles/role-assignment/constants/RoleTargetConfig';
import { buildRoleMaps } from '@/settings/roles/role-assignment/utils/build-role-maps';

type SettingsRoleAssignmentProps = {
  roleId: string;
  isCreateMode?: boolean;
};

export const SettingsRoleAssignment = ({
  roleId,
  isCreateMode,
}: SettingsRoleAssignmentProps) => {
  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);

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

  const { data: agentsData } = useFindManyAgentsQuery({ skip: !isAiEnabled });
  const { data: apiKeysData } = useGetApiKeysQuery();

  const { openModal, closeModal } = useModal();
  const [selectedRoleTarget, setSelectRoleTarget] =
    useState<SettingsRoleAssignmentConfirmationModalSelectedRoleTarget | null>(
      null,
    );

  const currentWorkspaceMembers = useRecoilValue(currentWorkspaceMembersState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const settingsAllRoles = useRecoilValue(settingsAllRolesSelector);

  const roleMaps = buildRoleMaps(settingsAllRoles);

  const assignedWorkspaceMemberIds =
    ROLE_TARGET_CONFIG.member.getAssignedIds(settingsDraftRole);

  const assignableWorkspaceMembers = currentWorkspaceMembers.filter(
    (member) => member.id !== currentWorkspaceMember?.id,
  );

  const allWorkspaceMembersHaveThisRole = assignableWorkspaceMembers.every(
    (member) => assignedWorkspaceMemberIds.includes(member.id),
  );

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
        case 'member':
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
        case 'member': {
          const member = currentWorkspaceMembers.find(
            (member) => member.id === selectedRoleTarget.id,
          );

          if (!member) {
            throw new Error('Workspace member not found');
          }

          updateWorkspaceMemberRoleDraftState({
            workspaceMember: {
              id: member.id,
              name: member.name,
              userEmail: member.userEmail,
              avatarUrl: member.avatarUrl,
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

          updateApiKeyRoleDraftState({
            apiKey: apiKeyData as ApiKeyForRole,
          });
          break;
        }
      }
    }

    handleModalClose();
  };

  const handleSelectEntity = (
    entity: PartialWorkspaceMember | Agent | ApiKeyForRole,
    entityType: keyof typeof ROLE_TARGET_CONFIG,
  ) => {
    const config = ROLE_TARGET_CONFIG[entityType];
    const existingRole = config.getRoleMap(roleMaps).get(entity.id);
    const name = config.getName(entity as never);

    setSelectRoleTarget({
      id: entity.id,
      name,
      role: existingRole,
      entityType: entityType as 'member' | 'agent' | 'apiKey',
    });

    openModal(ROLE_ASSIGNMENT_CONFIRMATION_MODAL_ID);
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
      {Object.keys(ROLE_TARGET_CONFIG).map(
        (roleTargetType) =>
          (isAiEnabled || roleTargetType !== 'agent') && (
            <RoleAssignmentSection
              key={roleTargetType}
              roleTargetType={roleTargetType as keyof typeof ROLE_TARGET_CONFIG}
              roleId={roleId}
              settingsDraftRole={settingsDraftRole}
              currentWorkspaceMember={
                roleTargetType === 'member'
                  ? currentWorkspaceMember || undefined
                  : undefined
              }
              onSelect={handleSelectEntity}
              allWorkspaceMembersHaveThisRole={
                roleTargetType === 'member'
                  ? allWorkspaceMembersHaveThisRole
                  : false
              }
            />
          ),
      )}

      {selectedRoleTarget && (
        <SettingsRoleAssignmentConfirmationModal
          selectedRoleTarget={selectedRoleTarget}
          onClose={handleModalClose}
          onConfirm={handleConfirm}
          onRoleClick={handleRoleClick}
          newRoleName={settingsDraftRole.label}
        />
      )}
    </>
  );
};
