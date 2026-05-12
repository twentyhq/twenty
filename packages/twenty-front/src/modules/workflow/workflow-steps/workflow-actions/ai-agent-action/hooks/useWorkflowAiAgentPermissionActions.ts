import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { useActionRolePermissionFlagGrantConfig } from '@/settings/roles/role-permissions/permission-flags/hooks/useActionRolePermissionFlagGrantConfig';
import { useSettingsRolePermissionFlagGrantConfig } from '@/settings/roles/role-permissions/permission-flags/hooks/useSettingsRolePermissionFlagGrantConfig';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CRUD_PERMISSIONS } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/WorkflowAiAgentCrudPermissions';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { workflowAiAgentActionAgentState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentActionAgentState';
import { workflowAiAgentPermissionsIsAddingPermissionState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsIsAddingPermissionState';
import { workflowAiAgentPermissionsSelectedObjectIdState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsSelectedObjectIdState';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { useMutation } from '@apollo/client/react';
import {
  type Agent,
  type ObjectPermission,
  type PermissionFlagType,
  AssignRoleToAgentDocument,
  CreateOneRoleDocument,
  UpsertObjectPermissionsDocument,
  UpsertPermissionFlagGrantsDocument,
} from '~/generated-metadata/graphql';

type UseWorkflowAiAgentPermissionActionsParams = {
  readonly: boolean;
  objectPermissions: ObjectPermission[];
  permissionFlagGrantKeys: PermissionFlagType[];
  refetchAgentAndRoles: () => Promise<{ refetchedAgent?: Agent }>;
};

export const useWorkflowAiAgentPermissionActions = ({
  readonly,
  objectPermissions,
  permissionFlagGrantKeys,
  refetchAgentAndRoles,
}: UseWorkflowAiAgentPermissionActionsParams) => {
  const { enqueueSuccessSnackBar } = useSnackBar();
  const [workflowAiAgentActionAgent, setWorkflowAiAgentActionAgent] =
    useAtomState(workflowAiAgentActionAgentState);
  const { alphaSortedActiveNonSystemObjectMetadataItems: objectMetadataItems } =
    useFilteredObjectMetadataItems();
  const settingsPermissionsConfig = useSettingsRolePermissionFlagGrantConfig({
    assignmentCapabilities: { canBeAssignedToAgents: true },
  });
  const actionPermissionsConfig = useActionRolePermissionFlagGrantConfig({
    assignmentCapabilities: { canBeAssignedToAgents: true },
  });

  const [, setWorkflowAiAgentPermissionsSelectedObjectId] = useAtomState(
    workflowAiAgentPermissionsSelectedObjectIdState,
  );
  const [, setWorkflowAiAgentPermissionsIsAddingPermission] = useAtomState(
    workflowAiAgentPermissionsIsAddingPermissionState,
  );

  const [createRole] = useMutation(CreateOneRoleDocument);
  const [assignRoleToAgent] = useMutation(AssignRoleToAgentDocument);
  const [upsertObjectPermissions] = useMutation(
    UpsertObjectPermissionsDocument,
  );
  const [upsertPermissionFlagGrants] = useMutation(
    UpsertPermissionFlagGrantsDocument,
  );

  const roleId = workflowAiAgentActionAgent?.roleId;

  const permissionFlagGrantLabelMap = useMemo(
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

    if (!isDefined(workflowAiAgentActionAgent) || readonly) {
      return undefined;
    }

    const agentDisplayName =
      workflowAiAgentActionAgent.label ??
      workflowAiAgentActionAgent.name ??
      t`Agent`;
    const agentIdPrefix = workflowAiAgentActionAgent.id.substring(0, 8);
    const roleName = t`${agentDisplayName} role (${agentIdPrefix})`;
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
    });

    await assignRoleToAgent({
      variables: {
        agentId: workflowAiAgentActionAgent.id,
        roleId: generatedRoleId,
      },
    });

    const { refetchedAgent } = await refetchAgentAndRoles();

    // Update state with the refetched agent to ensure roleId is available
    // Apollo's onCompleted is not called on refetch, so we need to update manually
    if (isDefined(refetchedAgent)) {
      setWorkflowAiAgentActionAgent(refetchedAgent);
    }

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
    });

    await refetchAgentAndRoles();
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
    });

    await refetchAgentAndRoles();
    const permissionLabel = CRUD_PERMISSIONS.find(
      (permission) => permission.key === permissionKey,
    )?.label(objectMetadata.labelPlural);

    if (isDefined(permissionLabel)) {
      enqueueSuccessSnackBar({
        message: t`${permissionLabel} Permission removed`,
      });
    }
  };

  const handleAddPermissionFlagGrant = async (
    permissionFlagGrantKey: PermissionFlagType,
  ) => {
    if (readonly) {
      return;
    }

    const ensuredRoleId = await ensureRoleId();

    if (
      !ensuredRoleId ||
      permissionFlagGrantKeys.includes(permissionFlagGrantKey)
    ) {
      return;
    }

    await upsertPermissionFlagGrants({
      variables: {
        upsertPermissionFlagGrantsInput: {
          roleId: ensuredRoleId,
          permissionFlagGrantKeys: [
            ...permissionFlagGrantKeys,
            permissionFlagGrantKey,
          ],
        },
      },
    });

    await refetchAgentAndRoles();
    setWorkflowAiAgentPermissionsIsAddingPermission(false);
    setWorkflowAiAgentPermissionsSelectedObjectId(undefined);
  };

  const handleDeletePermissionFlagGrant = async (
    permissionFlagGrantKey: PermissionFlagType,
  ) => {
    if (!isDefined(roleId) || readonly) {
      return;
    }

    if (!permissionFlagGrantKeys.includes(permissionFlagGrantKey)) {
      return;
    }

    const permissionFlagGrantKeysAfterRemoval = permissionFlagGrantKeys.filter(
      (flag) => flag !== permissionFlagGrantKey,
    );

    await upsertPermissionFlagGrants({
      variables: {
        upsertPermissionFlagGrantsInput: {
          roleId,
          permissionFlagGrantKeys: permissionFlagGrantKeysAfterRemoval,
        },
      },
    });

    await refetchAgentAndRoles();

    const permissionLabel = permissionFlagGrantLabelMap[permissionFlagGrantKey];

    if (isDefined(permissionLabel)) {
      enqueueSuccessSnackBar({
        message: t`${permissionLabel} permission removed`,
      });
    }
  };

  return {
    handleAddPermission,
    handleDeletePermission,
    handleAddPermissionFlagGrant,
    handleDeletePermissionFlagGrant,
  };
};
