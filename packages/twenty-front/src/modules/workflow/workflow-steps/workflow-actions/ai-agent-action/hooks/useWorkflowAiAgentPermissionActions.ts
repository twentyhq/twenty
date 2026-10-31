import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { useActionRolePermissionFlagConfig } from '@/settings/roles/role-permissions/permission-flags/hooks/useActionRolePermissionFlagConfig';
import { useSettingsRolePermissionFlagConfig } from '@/settings/roles/role-permissions/permission-flags/hooks/useSettingsRolePermissionFlagConfig';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { CRUD_PERMISSIONS } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/constants/WorkflowAiAgentCrudPermissions';
import { workflowAiAgentActionAgentState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentActionAgentState';
import { workflowAiAgentPermissionsIsAddingPermissionState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsIsAddingPermissionState';
import { workflowAiAgentPermissionsIsSystemObjectsListOpenState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsIsSystemObjectsListOpenState';
import { workflowAiAgentPermissionsSelectedObjectIdState } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/states/workflowAiAgentPermissionsSelectedObjectIdState';
import { grantWorkflowAiAgentObjectPermission } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/grantWorkflowAiAgentObjectPermission';
import { revokeWorkflowAiAgentObjectPermission } from '@/workflow/workflow-steps/workflow-actions/ai-agent-action/utils/revokeWorkflowAiAgentObjectPermission';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { v4 } from 'uuid';
import { type FlatAgent } from '@/metadata-store/types/FlatAgent';
import {
  type ObjectPermission,
  AssignRoleToAgentDocument,
  CreateOneRoleDocument,
  UpsertObjectPermissionsDocument,
  UpsertPermissionFlagsDocument,
} from '~/generated-metadata/graphql';

const toCrudObjectPermission = (
  objectPermission: ObjectPermission | undefined,
) =>
  isDefined(objectPermission)
    ? {
        canReadObjectRecords:
          objectPermission.canReadObjectRecords ?? undefined,
        canUpdateObjectRecords:
          objectPermission.canUpdateObjectRecords ?? undefined,
        canSoftDeleteObjectRecords:
          objectPermission.canSoftDeleteObjectRecords ?? undefined,
        canDestroyObjectRecords:
          objectPermission.canDestroyObjectRecords ?? undefined,
      }
    : undefined;

type UseWorkflowAiAgentPermissionActionsParams = {
  stepId: string;
  readonly: boolean;
  objectPermissions: ObjectPermission[];
  permissionFlagKeys: string[];
  refetchAgentAndRoles: () => Promise<{ refetchedAgent?: FlatAgent }>;
};

export const useWorkflowAiAgentPermissionActions = ({
  stepId,
  readonly,
  objectPermissions,
  permissionFlagKeys,
  refetchAgentAndRoles,
}: UseWorkflowAiAgentPermissionActionsParams) => {
  const { enqueueToast } = useToast();
  const { getUpdatableWorkflowVersionStepOrThrow } =
    useGetUpdatableWorkflowVersionOrThrow();
  const [workflowAiAgentActionAgent, setWorkflowAiAgentActionAgent] =
    useAtomState(workflowAiAgentActionAgentState);
  const { activeObjectMetadataItems: objectMetadataItems } =
    useFilteredObjectMetadataItems();
  const settingsPermissionsConfig = useSettingsRolePermissionFlagConfig({
    assignmentCapabilities: { canBeAssignedToAgents: true },
  });
  const actionPermissionsConfig = useActionRolePermissionFlagConfig({
    assignmentCapabilities: { canBeAssignedToAgents: true },
  });

  const [, setWorkflowAiAgentPermissionsSelectedObjectId] = useAtomState(
    workflowAiAgentPermissionsSelectedObjectIdState,
  );
  const [, setWorkflowAiAgentPermissionsIsAddingPermission] = useAtomState(
    workflowAiAgentPermissionsIsAddingPermissionState,
  );
  const [, setWorkflowAiAgentPermissionsIsSystemObjectsListOpen] = useAtomState(
    workflowAiAgentPermissionsIsSystemObjectsListOpenState,
  );

  const [createRole] = useMutation(CreateOneRoleDocument);
  const [assignRoleToAgent] = useMutation(AssignRoleToAgentDocument);
  const [upsertObjectPermissions] = useMutation(
    UpsertObjectPermissionsDocument,
  );
  const [upsertPermissionFlags] = useMutation(UpsertPermissionFlagsDocument);

  const roleId = workflowAiAgentActionAgent?.roleId;

  const permissionFlagLabelMap = useMemo(
    () =>
      [...settingsPermissionsConfig, ...actionPermissionsConfig].reduce<
        Partial<Record<string, string>>
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

    const updatableStep = await getUpdatableWorkflowVersionStepOrThrow({
      stepId,
      stepType: 'AI_AGENT',
    });

    const updatableAgentId = updatableStep.settings.input.agentId;

    if (!isDefined(updatableAgentId)) {
      throw new Error(doNotTranslate('The AI agent step has no agent'));
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
          icon: 'IconLego',
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
        agentId: updatableAgentId,
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

    const updatedPermission = grantWorkflowAiAgentObjectPermission({
      objectMetadataId,
      objectPermission: toCrudObjectPermission(objectPermission),
      permissionKey,
    });

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

    allObjectPermissions.push(updatedPermission);

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
    setWorkflowAiAgentPermissionsIsSystemObjectsListOpen(false);
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

    const updatedPermission = revokeWorkflowAiAgentObjectPermission({
      objectMetadataId,
      objectPermission: toCrudObjectPermission(objectPermission) ?? {},
      permissionKey,
    });

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

    allObjectPermissions.push(updatedPermission);

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
      enqueueToast({
        status: 'success',
        children: t`${permissionLabel} Permission removed`,
      });
    }
  };

  const handleAddPermissionFlag = async (permissionFlagKey: string) => {
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
    });

    await refetchAgentAndRoles();
    setWorkflowAiAgentPermissionsIsAddingPermission(false);
    setWorkflowAiAgentPermissionsSelectedObjectId(undefined);
    setWorkflowAiAgentPermissionsIsSystemObjectsListOpen(false);
  };

  const handleDeletePermissionFlag = async (permissionFlagKey: string) => {
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
    });

    await refetchAgentAndRoles();

    const permissionLabel = permissionFlagLabelMap[permissionFlagKey];

    if (isDefined(permissionLabel)) {
      enqueueToast({
        status: 'success',
        children: t`${permissionLabel} permission removed`,
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
