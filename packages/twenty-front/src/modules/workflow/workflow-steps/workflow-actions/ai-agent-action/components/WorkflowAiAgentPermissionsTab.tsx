import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TextInput } from '@/ui/input/components/TextInput';
import { type WorkflowAiAgentAction } from '@/workflow/types/Workflow';
import { workflowAiAgentActionAgentState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentActionAgentState';
import { workflowAiAgentPermissionsIsAddingPermissionState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsIsAddingPermissionState';
import { workflowAiAgentPermissionsSelectedObjectIdState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsSelectedObjectIdState';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { v4 } from 'uuid';
import {
  type ObjectPermission,
  useAssignRoleToAgentMutation,
  useCreateOneRoleMutation,
  useGetRolesQuery,
  useUpsertObjectPermissionsMutation,
} from '~/generated-metadata/graphql';
import { RightDrawerSkeletonLoader } from '~/loading/components/RightDrawerSkeletonLoader';

import { StyledContainer } from '@/keyboard-shortcut-menu/components/KeyboardShortcutMenuStyles';
import { WorkflowAiAgentPermissionList } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/components/WorkflowAiAgentPermissionList';
import { WorkflowAiAgentPermissionsCrudList } from './WorkflowAiAgentPermissionsCrudList';
import { WorkflowAiAgentPermissionsObjectsList } from './WorkflowAiAgentPermissionsObjectsList';

const StyledSearchInput = styled(TextInput)`
  width: 100%;
  height: 40px;
  border-block: 1px solid ${({ theme }) => theme.border.color.medium};
  input {
    height: 40px;
    line-height: 40px;
    border: none;
    border-radius: 0;
    width: 100%;
  }
`;

const StyledBackButtonText = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledBackButton = styled.button`
  width: 100%;
  align-items: center;
  background: none;
  border: none;
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(3)};
  text-align: left;

  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledContainer = styled.div`
  width: 100%;
`;

const StyledEmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing(4)};
`;

const CRUD_PERMISSIONS: Array<{
  key: SettingsRoleObjectPermissionKey;
  label: (objectLabel: string) => string;
}> = [
  {
    key: 'canReadObjectRecords',
    label: (objectLabel: string) => `See ${objectLabel}`,
  },
  {
    key: 'canUpdateObjectRecords',
    label: (objectLabel: string) => `Edit ${objectLabel}`,
  },
  {
    key: 'canSoftDeleteObjectRecords',
    label: (objectLabel: string) => `Delete ${objectLabel}`,
  },
  {
    key: 'canDestroyObjectRecords',
    label: (objectLabel: string) => `Destroy ${objectLabel}`,
  },
];

type WorkflowAiAgentPermissionsTabProps = {
  action: WorkflowAiAgentAction;
  readonly: boolean;
  isAgentLoading: boolean;
  refetchAgent: () => Promise<unknown>;
};

export const WorkflowAiAgentPermissionsTab = ({
  action,
  readonly,
  isAgentLoading,
  refetchAgent,
}: WorkflowAiAgentPermissionsTabProps) => {
  const { enqueueSuccessSnackBar } = useSnackBar();
  const agent = useRecoilValue(workflowAiAgentActionAgentState(action.id));
  const [
    workflowAiAgentPermissionsSelectedObjectId,
    setWorkflowAiAgentPermissionsSelectedObjectId,
  ] = useRecoilState(workflowAiAgentPermissionsSelectedObjectIdState);
  const [
    workflowAiAgentPermissionsIsAddingPermission,
    setWorkflowAiAgentPermissionsIsAddingPermission,
  ] = useRecoilState(workflowAiAgentPermissionsIsAddingPermissionState);

  const { alphaSortedActiveNonSystemObjectMetadataItems: objectMetadataItems } =
    useFilteredObjectMetadataItems();

  const { data: rolesData, loading: rolesLoading } = useGetRolesQuery();

  const [searchQuery, setSearchQuery] = useState('');
  const [createRole] = useCreateOneRoleMutation();
  const [assignRoleToAgent] = useAssignRoleToAgentMutation();
  const [upsertObjectPermissions] = useUpsertObjectPermissionsMutation();

  const role = rolesData?.getRoles.find((item) => item.id === agent?.roleId);
  const objectPermissions = role?.objectPermissions || [];

  const filteredObjects = searchQuery.trim()
    ? objectMetadataItems.filter((item) => {
        const query = searchQuery.toLowerCase();
        return (
          item.labelSingular.toLowerCase().includes(query) ||
          item.labelPlural.toLowerCase().includes(query)
        );
      })
    : objectMetadataItems;

  const ensureRoleId = async (): Promise<string | undefined> => {
    if (isDefined(agent?.roleId)) {
      return agent.roleId;
    }

    if (!isDefined(agent) || readonly) {
      return undefined;
    }

    const agentDisplayName = agent.label ?? agent.name ?? t`Agent`;
    const roleName = `${agentDisplayName} role (${agent.id.substring(0, 8)})`;

    const roleId = v4();

    await createRole({
      variables: {
        createRoleInput: {
          id: roleId,
          label: roleName,
          description: t`Auto-generated role for ${agentDisplayName}`,
          icon: 'IconRobot',
          canAccessAllTools: false,
          canUpdateAllSettings: false,
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
          canBeAssignedToAgents: true,
          canBeAssignedToUsers: false,
          canBeAssignedToApiKeys: false,
        },
      },
      refetchQueries: ['GetRoles'],
    });

    await assignRoleToAgent({
      variables: { agentId: agent.id, roleId },
      refetchQueries: ['GetRoles'],
    });

    await refetchAgent();

    return roleId;
  };

  const handleAddPermission = async (
    objectMetadataId: string,
    permissionKey: SettingsRoleObjectPermissionKey,
  ) => {
    const roleId = await ensureRoleId();

    if (!roleId) {
      return;
    }

    const objectPermission = objectPermissions.find(
      (permission) => permission.objectMetadataId === objectMetadataId,
    );

    const updatedPermission: ObjectPermission = {
      objectMetadataId,
      canReadObjectRecords:
        permissionKey === 'canReadObjectRecords'
          ? true
          : (objectPermission?.canReadObjectRecords ??
            (permissionKey === 'canUpdateObjectRecords' ||
            permissionKey === 'canSoftDeleteObjectRecords' ||
            permissionKey === 'canDestroyObjectRecords'
              ? true
              : false)),
      canUpdateObjectRecords:
        permissionKey === 'canUpdateObjectRecords'
          ? true
          : (objectPermission?.canUpdateObjectRecords ?? false),
      canSoftDeleteObjectRecords:
        permissionKey === 'canSoftDeleteObjectRecords'
          ? true
          : (objectPermission?.canSoftDeleteObjectRecords ?? false),
      canDestroyObjectRecords:
        permissionKey === 'canDestroyObjectRecords'
          ? true
          : (objectPermission?.canDestroyObjectRecords ?? false),
    };

    const allObjectPermissions = objectPermissions
      .filter((perm) => perm.objectMetadataId !== objectMetadataId)
      .map((perm) => ({
        objectMetadataId: perm.objectMetadataId,
        canReadObjectRecords: perm.canReadObjectRecords ?? false,
        canUpdateObjectRecords: perm.canUpdateObjectRecords ?? false,
        canSoftDeleteObjectRecords: perm.canSoftDeleteObjectRecords ?? false,
        canDestroyObjectRecords: perm.canDestroyObjectRecords ?? false,
      }));

    allObjectPermissions.push({
      objectMetadataId: updatedPermission.objectMetadataId,
      canReadObjectRecords: updatedPermission.canReadObjectRecords ?? false,
      canUpdateObjectRecords: updatedPermission.canUpdateObjectRecords ?? false,
      canSoftDeleteObjectRecords:
        updatedPermission.canSoftDeleteObjectRecords ?? false,
      canDestroyObjectRecords:
        updatedPermission.canDestroyObjectRecords ?? false,
    });

    await upsertObjectPermissions({
      variables: {
        upsertObjectPermissionsInput: {
          roleId,
          objectPermissions: allObjectPermissions,
        },
      },
      refetchQueries: ['GetRoles'],
    });

    await refetchAgent();
    setWorkflowAiAgentPermissionsIsAddingPermission(false);
    setWorkflowAiAgentPermissionsSelectedObjectId(undefined);
  };

  const handleDeletePermission = async (
    objectMetadataId: string,
    permissionKey: SettingsRoleObjectPermissionKey,
  ) => {
    if (!isDefined(role?.id) || readonly) {
      return;
    }

    const objectPermission = objectPermissions.find(
      (permission) => permission.objectMetadataId === objectMetadataId,
    );

    if (!isDefined(objectPermission)) {
      return;
    }

    const objectMetadata = objectMetadataItems.find(
      (item) => item.id === objectMetadataId,
    );

    if (!objectMetadata) {
      return;
    }

    const permissionLabel = CRUD_PERMISSIONS.find(
      (p) => p.key === permissionKey,
    )?.label(objectMetadata.labelPlural);

    const updatedPermission: ObjectPermission = {
      objectMetadataId,
      canReadObjectRecords:
        permissionKey === 'canReadObjectRecords'
          ? false
          : (objectPermission.canReadObjectRecords ?? false),
      canUpdateObjectRecords:
        permissionKey === 'canUpdateObjectRecords'
          ? false
          : (objectPermission.canUpdateObjectRecords ?? false),
      canSoftDeleteObjectRecords:
        permissionKey === 'canSoftDeleteObjectRecords'
          ? false
          : (objectPermission.canSoftDeleteObjectRecords ?? false),
      canDestroyObjectRecords:
        permissionKey === 'canDestroyObjectRecords'
          ? false
          : (objectPermission.canDestroyObjectRecords ?? false),
    };

    if (permissionKey === 'canReadObjectRecords') {
      updatedPermission.canUpdateObjectRecords = false;
      updatedPermission.canSoftDeleteObjectRecords = false;
      updatedPermission.canDestroyObjectRecords = false;
    }

    const allObjectPermissions = objectPermissions
      .filter((perm) => perm.objectMetadataId !== objectMetadataId)
      .map((perm) => ({
        objectMetadataId: perm.objectMetadataId,
        canReadObjectRecords: perm.canReadObjectRecords ?? false,
        canUpdateObjectRecords: perm.canUpdateObjectRecords ?? false,
        canSoftDeleteObjectRecords: perm.canSoftDeleteObjectRecords ?? false,
        canDestroyObjectRecords: perm.canDestroyObjectRecords ?? false,
      }));

    allObjectPermissions.push({
      objectMetadataId: updatedPermission.objectMetadataId,
      canReadObjectRecords: updatedPermission.canReadObjectRecords ?? false,
      canUpdateObjectRecords: updatedPermission.canUpdateObjectRecords ?? false,
      canSoftDeleteObjectRecords:
        updatedPermission.canSoftDeleteObjectRecords ?? false,
      canDestroyObjectRecords:
        updatedPermission.canDestroyObjectRecords ?? false,
    });

    await upsertObjectPermissions({
      variables: {
        upsertObjectPermissionsInput: {
          roleId: role.id,
          objectPermissions: allObjectPermissions,
        },
      },
      refetchQueries: ['GetRoles'],
    });

    await refetchAgent();
    enqueueSuccessSnackBar({
      message: t`${permissionLabel} Permission removed`,
    });
  };

  if (isAgentLoading || rolesLoading) {
    return <RightDrawerSkeletonLoader />;
  }

  if (!isDefined(agent)) {
    return null;
  }

  const selectedObject = isDefined(workflowAiAgentPermissionsSelectedObjectId)
    ? objectMetadataItems.find(
        (item) => item.id === workflowAiAgentPermissionsSelectedObjectId,
      )
    : undefined;

  const objectPermissionForSelected = isDefined(selectedObject)
    ? objectPermissions.find(
        (permission) => permission.objectMetadataId === selectedObject.id,
      )
    : undefined;

  const handleBack = () => {
    isDefined(workflowAiAgentPermissionsSelectedObjectId) &&
      setWorkflowAiAgentPermissionsSelectedObjectId(undefined);
    !isDefined(workflowAiAgentPermissionsSelectedObjectId) &&
      setWorkflowAiAgentPermissionsIsAddingPermission(false);
  };

  const handleObjectClick = (objectId: string) => {
    setWorkflowAiAgentPermissionsSelectedObjectId(objectId);
  };

  return (
    <StyledContainer>
      {(isDefined(workflowAiAgentPermissionsSelectedObjectId) ||
        workflowAiAgentPermissionsIsAddingPermission) && (
        <StyledBackButton onClick={handleBack}>
          <IconButton Icon={IconChevronLeft} variant="tertiary" size="small" />
          <StyledBackButtonText>{t`Add permission`}</StyledBackButtonText>
        </StyledBackButton>
      )}

      <StyledSearchInput
        value={searchQuery}
        onChange={(value: string) => setSearchQuery(value)}
        placeholder={t`Type anything...`}
      />

      {isDefined(selectedObject) &&
        workflowAiAgentPermissionsIsAddingPermission && (
          <WorkflowAiAgentPermissionsCrudList
            permissions={CRUD_PERMISSIONS.map((p) => ({
              key: p.key,
              label: p.label(selectedObject.labelPlural),
            }))}
            objectPermissions={objectPermissionForSelected}
            readonly={readonly}
            onAddPermission={handleAddPermission}
            objectMetadataId={selectedObject.id}
          />
        )}

      {(!agent.roleId || workflowAiAgentPermissionsIsAddingPermission) &&
        !isDefined(selectedObject) && (
          <WorkflowAiAgentPermissionsObjectsList
            objects={filteredObjects}
            onObjectClick={handleObjectClick}
            readonly={readonly}
          />
        )}

      {isDefined(agent.roleId) &&
        !workflowAiAgentPermissionsIsAddingPermission && (
          // <div>
          //   <StyledLabel>CRUD</StyledLabel>
          //   {sortedExistingPermissions.length > 0 ? (
          //     <StyledList>
          //       {sortedExistingPermissions.map((permission) => (
          //         <WorkflowAiAgentPermissionsPermissionRow
          //           key={`${permission.objectMetadataId}-${permission.permissionKey}`}
          //           permission={{
          //             key: permission.permissionKey,
          //             label: permission.permissionLabel,
          //           }}
          //           isEnabled={true}
          //           readonly={readonly}
          //           onDelete={() => {
          //             void handleDeletePermission(
          //               permission.objectMetadataId,
          //               permission.permissionKey,
          //             );
          //           }}
          //         />
          //       ))}
          //     </StyledList>
          //   ) : (
          //     <StyledList>
          //       <StyledEmptyState>
          //         <StyledText>{t`No permissions added yet`}</StyledText>
          //       </StyledEmptyState>
          //     </StyledList>
          //   )}
          // </div>
          <WorkflowAiAgentPermissionList
            readonly={readonly}
            objectPermissions={objectPermissions}
            onDeletePermission={handleDeletePermission}
          />
        )}
    </StyledContainer>
  );
};
