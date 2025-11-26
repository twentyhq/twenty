import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { useActionRolePermissionFlagConfig } from '@/settings/roles/role-permissions/permission-flags/hooks/useActionRolePermissionFlagConfig';
import { useSettingsRolePermissionFlagConfig } from '@/settings/roles/role-permissions/permission-flags/hooks/useSettingsRolePermissionFlagConfig';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CRUD_PERMISSIONS } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/WorkflowAiAgentCrudPermissions';
import { workflowAiAgentPermissionsIsAddingPermissionState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsIsAddingPermissionState';
import { workflowAiAgentPermissionsSelectedObjectIdState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsSelectedObjectIdState';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import {
  useAssignRoleToAgentMutation,
  useCreateOneRoleMutation,
  useUpsertObjectPermissionsMutation,
  useUpsertPermissionFlagsMutation,
  type Agent,
  type ObjectPermission,
  type PermissionFlagType,
} from '~/generated-metadata/graphql';

type UseWorkflowAiAgentPermissionActionsParams = {
  agent: Agent | undefined;
  readonly: boolean;
  objectPermissions: ObjectPermission[];
  permissionFlagKeys: PermissionFlagType[];
  refetchAgent: () => Promise<unknown>;
};

export const useWorkflowAiAgentPermissionActions = ({
  agent,
  readonly,
  objectPermissions,
  permissionFlagKeys,
  refetchAgent,
}: UseWorkflowAiAgentPermissionActionsParams) => {
  const { enqueueSuccessSnackBar } = useSnackBar();
  const { alphaSortedActiveNonSystemObjectMetadataItems: objectMetadataItems } =
    useFilteredObjectMetadataItems();
  const settingsPermissionsConfig = useSettingsRolePermissionFlagConfig();
  const actionPermissionsConfig = useActionRolePermissionFlagConfig();

  const [, setWorkflowAiAgentPermissionsSelectedObjectId] = useRecoilState(
    workflowAiAgentPermissionsSelectedObjectIdState,
  );
  const [, setWorkflowAiAgentPermissionsIsAddingPermission] = useRecoilState(
    workflowAiAgentPermissionsIsAddingPermissionState,
  );

  const [createRole] = useCreateOneRoleMutation();
  const [assignRoleToAgent] = useAssignRoleToAgentMutation();
  const [upsertObjectPermissions] = useUpsertObjectPermissionsMutation();
  const [upsertPermissionFlags] = useUpsertPermissionFlagsMutation();

  const roleId = agent?.roleId;

  const permissionFlagLabelMap = useMemo(
    () =>
      [...settingsPermissionsConfig, ...actionPermissionsConfig].reduce<
        Partial<Record<PermissionFlagType, string>>
      >((acc, permission) => {
        acc[permission.key] = permission.name;
        return acc;
      }, {}),
    [settingsPermissionsConfig, actionPermissionsConfig],
  );

  const ensureRoleId = async (): Promise<string | undefined> => {
    if (isDefined(roleId)) {
      return roleId;
    }

    if (!isDefined(agent) || readonly) {
      return undefined;
    }

    const agentDisplayName = agent.label ?? agent.name ?? t`Agent`;
    const roleName = `${agentDisplayName} role (${agent.id.substring(0, 8)})`;
    const generatedRoleId = v4();

    await createRole({
      variables: {
        createRoleInput: {
          id: generatedRoleId,
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
      variables: { agentId: agent.id, roleId: generatedRoleId },
      refetchQueries: ['GetRoles'],
    });

    await refetchAgent();

    return generatedRoleId;
  };

  const handleAddPermission = async (
    objectMetadataId: string,
    permissionKey: SettingsRoleObjectPermissionKey,
  ) => {
    const ensuredRoleId = await ensureRoleId();

    if (!ensuredRoleId) {
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
      .filter((permission) => permission.objectMetadataId !== objectMetadataId)
      .map((permission) => ({
        objectMetadataId: permission.objectMetadataId,
        canReadObjectRecords: permission.canReadObjectRecords ?? false,
        canUpdateObjectRecords: permission.canUpdateObjectRecords ?? false,
        canSoftDeleteObjectRecords:
          permission.canSoftDeleteObjectRecords ?? false,
        canDestroyObjectRecords: permission.canDestroyObjectRecords ?? false,
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
          roleId: ensuredRoleId,
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
    if (!isDefined(roleId) || readonly) {
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

    if (!isDefined(objectMetadata)) {
      return;
    }

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
      .filter((permission) => permission.objectMetadataId !== objectMetadataId)
      .map((permission) => ({
        objectMetadataId: permission.objectMetadataId,
        canReadObjectRecords: permission.canReadObjectRecords ?? false,
        canUpdateObjectRecords: permission.canUpdateObjectRecords ?? false,
        canSoftDeleteObjectRecords:
          permission.canSoftDeleteObjectRecords ?? false,
        canDestroyObjectRecords: permission.canDestroyObjectRecords ?? false,
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
    const permissionLabel = CRUD_PERMISSIONS.find(
      (permission) => permission.key === permissionKey,
    )?.label(objectMetadata.labelPlural);

    if (isDefined(permissionLabel)) {
      enqueueSuccessSnackBar({
        message: t`${permissionLabel} Permission removed`,
      });
    }
  };

  const handleAddPermissionFlag = async (
    permissionFlagKey: PermissionFlagType,
  ) => {
    if (readonly) {
      return;
    }

    const ensuredRoleId = await ensureRoleId();

    if (!ensuredRoleId || permissionFlagKeys.includes(permissionFlagKey)) {
      return;
    }

    await upsertPermissionFlags({
      variables: {
        upsertPermissionFlagsInput: {
          roleId: ensuredRoleId,
          permissionFlagKeys: [...permissionFlagKeys, permissionFlagKey],
        },
      },
      refetchQueries: ['GetRoles'],
    });

    await refetchAgent();
    setWorkflowAiAgentPermissionsIsAddingPermission(false);
    setWorkflowAiAgentPermissionsSelectedObjectId(undefined);
  };

  const handleDeletePermissionFlag = async (
    permissionFlagKey: PermissionFlagType,
  ) => {
    if (!isDefined(roleId) || readonly) {
      return;
    }

    if (!permissionFlagKeys.includes(permissionFlagKey)) {
      return;
    }

    const permissionFlagKeysAfterRemoval = permissionFlagKeys.filter(
      (flag) => flag !== permissionFlagKey,
    );

    await upsertPermissionFlags({
      variables: {
        upsertPermissionFlagsInput: {
          roleId,
          permissionFlagKeys: permissionFlagKeysAfterRemoval,
        },
      },
      refetchQueries: ['GetRoles'],
    });

    await refetchAgent();

    const permissionLabel = permissionFlagLabelMap[permissionFlagKey];

    if (isDefined(permissionLabel)) {
      enqueueSuccessSnackBar({
        message: t`${permissionLabel} permission removed`,
      });
    }
  };

  return {
    handleAddPermission,
    handleDeletePermission,
    handleAddPermissionFlag,
    handleDeletePermissionFlag,
  };
};
