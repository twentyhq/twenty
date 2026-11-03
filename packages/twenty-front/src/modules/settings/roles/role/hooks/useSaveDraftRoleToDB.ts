import { useUpsertRowLevelPermissionPredicatesMutation } from '@/settings/roles/graphql/hooks/useUpsertRowLevelPermissionPredicatesMutation';
import { GET_ROLES } from '@/settings/roles/graphql/queries/getRolesQuery';
import { type RoleSaveSubmission } from '@/settings/roles/role/types/RoleSaveSubmission';
import { buildRoleSaveSnapshotOrThrow } from '@/settings/roles/role/utils/buildRoleSaveSnapshotOrThrow';
import { settingsDraftRoleBaseFamilyState } from '@/settings/roles/states/settingsDraftRoleBaseFamilyState';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { useRoutedFlowStateScopeId } from '@/ui/utilities/state/contexts/RoutedFlowStateScopeContext';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { CustomError, isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import {
  type Role,
  AssignRoleToAgentDocument,
  AssignRoleToApiKeyDocument,
  CreateOneRoleDocument,
  UpdateOneRoleDocument,
  UpdateWorkspaceMemberRoleDocument,
  UpsertFieldPermissionsDocument,
  UpsertObjectPermissionsDocument,
  UpsertPermissionFlagsDocument,
} from '~/generated-metadata/graphql';
import { getOperationName } from '~/utils/getOperationName';

type RoleSaveSnapshot = ReturnType<typeof buildRoleSaveSnapshotOrThrow>;

const ROLE_BASIC_KEYS: Array<keyof Role> = [
  'label',
  'description',
  'icon',
  'canUpdateAllSettings',
  'canAccessAllTools',
  'canAccessAllAgentChatChannels',
  'canReadAllObjectRecords',
  'canUpdateAllObjectRecords',
  'canSoftDeleteAllObjectRecords',
  'canDestroyAllObjectRecords',
  'canBeAssignedToUsers',
  'canBeAssignedToAgents',
  'canBeAssignedToApiKeys',
];

export const useSaveDraftRoleToDB = ({
  roleId,
  isCreateMode,
  onSuccess,
}: {
  roleId: string;
  isCreateMode: boolean;
  onSuccess?: (savedRoleId: string) => void | Promise<void>;
}) => {
  const store = useStore();
  const routedFlowStateScopeId = useRoutedFlowStateScopeId();
  const [assignRoleToAgent] = useMutation(AssignRoleToAgentDocument);
  const [assignRoleToApiKey] = useMutation(AssignRoleToApiKeyDocument);
  const [updateWorkspaceMemberRole] = useMutation(
    UpdateWorkspaceMemberRoleDocument,
  );
  const [createRole] = useMutation(CreateOneRoleDocument, {
    awaitRefetchQueries: true,
  });
  const [updateRole] = useMutation(UpdateOneRoleDocument, {
    awaitRefetchQueries: true,
  });
  const [upsertPermissionFlags] = useMutation(UpsertPermissionFlagsDocument, {
    awaitRefetchQueries: true,
  });
  const [upsertObjectPermissions] = useMutation(
    UpsertObjectPermissionsDocument,
    { awaitRefetchQueries: true },
  );
  const [upsertFieldPermissions] = useMutation(UpsertFieldPermissionsDocument, {
    awaitRefetchQueries: true,
  });
  const [upsertRowLevelPermissionPredicates] =
    useUpsertRowLevelPermissionPredicatesMutation();

  const createNewRole = async (snapshot: RoleSaveSnapshot) => {
    const { roleId, draftRole: settingsDraftRole } = snapshot;
    const { data } = await createRole({
      variables: {
        createRoleInput: {
          id: roleId,
          label: settingsDraftRole.label,
          description: settingsDraftRole.description,
          icon: settingsDraftRole.icon,
          canUpdateAllSettings: settingsDraftRole.canUpdateAllSettings,
          canAccessAllTools: settingsDraftRole.canAccessAllTools,
          canAccessAllAgentChatChannels:
            settingsDraftRole.canAccessAllAgentChatChannels,
          canReadAllObjectRecords: settingsDraftRole.canReadAllObjectRecords,
          canUpdateAllObjectRecords:
            settingsDraftRole.canUpdateAllObjectRecords,
          canSoftDeleteAllObjectRecords:
            settingsDraftRole.canSoftDeleteAllObjectRecords,
          canDestroyAllObjectRecords:
            settingsDraftRole.canDestroyAllObjectRecords,
          canBeAssignedToUsers: settingsDraftRole.canBeAssignedToUsers,
          canBeAssignedToAgents: settingsDraftRole.canBeAssignedToAgents,
          canBeAssignedToApiKeys: settingsDraftRole.canBeAssignedToApiKeys,
        } satisfies Partial<Role>,
      },
      refetchQueries: [getOperationName(GET_ROLES) ?? ''],
    });

    if (!data) {
      return;
    }

    const createdRoleId = data.createOneRole.id;

    await upsertRolePermissions({ snapshot, targetRoleId: createdRoleId });
    await assignEntitiesToRole({ snapshot, targetRoleId: createdRoleId });

    return createdRoleId;
  };

  const updateExistingRole = async (snapshot: RoleSaveSnapshot) => {
    const {
      roleId,
      draftRole: settingsDraftRole,
      dirtyFields,
      fieldPermissionsToUpsert,
    } = snapshot;

    if (isDefined(dirtyFields.permissionFlags)) {
      await upsertPermissionFlags({
        variables: {
          upsertPermissionFlagsInput: {
            roleId: roleId,
            permissionFlagKeys:
              settingsDraftRole.permissionFlags?.map(
                (permissionFlag) => permissionFlag.flag,
              ) ?? [],
          },
        },
        refetchQueries: [getOperationName(GET_ROLES) ?? ''],
      });
    }

    if (ROLE_BASIC_KEYS.some((key) => key in dirtyFields)) {
      await updateRole({
        variables: {
          updateRoleInput: {
            id: roleId,
            update: {
              label: settingsDraftRole.label,
              description: settingsDraftRole.description,
              icon: settingsDraftRole.icon,
              canUpdateAllSettings: settingsDraftRole.canUpdateAllSettings,
              canAccessAllTools: settingsDraftRole.canAccessAllTools,
              canAccessAllAgentChatChannels:
                settingsDraftRole.canAccessAllAgentChatChannels,
              canReadAllObjectRecords:
                settingsDraftRole.canReadAllObjectRecords,
              canUpdateAllObjectRecords:
                settingsDraftRole.canUpdateAllObjectRecords,
              canSoftDeleteAllObjectRecords:
                settingsDraftRole.canSoftDeleteAllObjectRecords,
              canDestroyAllObjectRecords:
                settingsDraftRole.canDestroyAllObjectRecords,
              canBeAssignedToUsers: settingsDraftRole.canBeAssignedToUsers,
              canBeAssignedToAgents: settingsDraftRole.canBeAssignedToAgents,
              canBeAssignedToApiKeys: settingsDraftRole.canBeAssignedToApiKeys,
            },
          },
        },
        refetchQueries: [getOperationName(GET_ROLES) ?? ''],
      });
    }

    if (isDefined(dirtyFields.objectPermissions)) {
      await upsertObjectPermissions({
        variables: {
          upsertObjectPermissionsInput: {
            roleId: roleId,
            objectPermissions:
              settingsDraftRole.objectPermissions?.map((objectPermission) => ({
                objectMetadataId: objectPermission.objectMetadataId,
                canReadObjectRecords: objectPermission.canReadObjectRecords,
                canUpdateObjectRecords: objectPermission.canUpdateObjectRecords,
                canSoftDeleteObjectRecords:
                  objectPermission.canSoftDeleteObjectRecords,
                canDestroyObjectRecords:
                  objectPermission.canDestroyObjectRecords,
              })) ?? [],
          },
        },
        refetchQueries: [getOperationName(GET_ROLES) ?? ''],
      });
    }

    if (isNonEmptyArray(fieldPermissionsToUpsert)) {
      await upsertFieldPermissions({
        variables: {
          upsertFieldPermissionsInput: {
            roleId: roleId,
            fieldPermissions:
              fieldPermissionsToUpsert.map((fieldPermission) => ({
                objectMetadataId: fieldPermission.objectMetadataId,
                fieldMetadataId: fieldPermission.fieldMetadataId,
                canReadFieldValue: fieldPermission.canReadFieldValue,
                canUpdateFieldValue: fieldPermission.canUpdateFieldValue,
              })) ?? [],
          },
        },
        refetchQueries: [getOperationName(GET_ROLES) ?? ''],
      });
    }

    if (
      isDefined(dirtyFields.rowLevelPermissionPredicates) ||
      isDefined(dirtyFields.rowLevelPermissionPredicateGroups)
    ) {
      await upsertRowLevelPermissionPredicatesForRole({
        snapshot,
        targetRoleId: roleId,
      });
    }

    await assignEntitiesToRole({ snapshot, targetRoleId: roleId });

    return roleId;
  };

  const upsertRowLevelPermissionPredicatesForRole = async ({
    snapshot,
    targetRoleId,
  }: {
    snapshot: RoleSaveSnapshot;
    targetRoleId: string;
  }) => {
    const {
      draftRole: settingsDraftRole,
      persistedRole: settingsPersistedRole,
    } = snapshot;
    const predicates = settingsDraftRole.rowLevelPermissionPredicates ?? [];
    const predicateGroups =
      settingsDraftRole.rowLevelPermissionPredicateGroups ?? [];

    const predicatesByObject = predicates.reduce<
      Record<string, typeof predicates>
    >((acc, predicate) => {
      const objectMetadataId = predicate.objectMetadataId;

      if (!isDefined(acc[objectMetadataId])) {
        acc[objectMetadataId] = [];
      }
      acc[objectMetadataId].push(predicate);

      return acc;
    }, {});

    const persistedPredicates =
      settingsPersistedRole?.rowLevelPermissionPredicates ?? [];
    const persistedObjectIds = new Set(
      persistedPredicates.map((predicate) => predicate.objectMetadataId),
    );

    for (const objectMetadataId of persistedObjectIds) {
      if (!isDefined(predicatesByObject[objectMetadataId])) {
        predicatesByObject[objectMetadataId] = [];
      }
    }

    for (const [objectMetadataId, objectPredicates] of Object.entries(
      predicatesByObject,
    )) {
      const objectUsedGroupIds = new Set(
        objectPredicates
          .map((p) => p.rowLevelPermissionPredicateGroupId)
          .filter(isDefined),
      );

      const includeParentGroupsForObject = (groupId: string) => {
        const group = predicateGroups.find((g) => g.id === groupId);
        if (
          isDefined(group?.parentRowLevelPermissionPredicateGroupId) &&
          !objectUsedGroupIds.has(
            group.parentRowLevelPermissionPredicateGroupId,
          )
        ) {
          objectUsedGroupIds.add(
            group.parentRowLevelPermissionPredicateGroupId,
          );
          includeParentGroupsForObject(
            group.parentRowLevelPermissionPredicateGroupId,
          );
        }
      };

      for (const groupId of objectUsedGroupIds) {
        includeParentGroupsForObject(groupId);
      }

      const objectPredicateGroups = predicateGroups.filter((group) =>
        objectUsedGroupIds.has(group.id),
      );

      await upsertRowLevelPermissionPredicates({
        variables: {
          input: {
            roleId: targetRoleId,
            objectMetadataId,
            predicates: objectPredicates.map((predicate) => ({
              id: predicate.id,
              fieldMetadataId: predicate.fieldMetadataId,
              relationFieldMetadataId: predicate.relationFieldMetadataId,
              operand: predicate.operand,
              value: predicate.value,
              subFieldName: predicate.subFieldName,
              workspaceMemberFieldMetadataId:
                predicate.workspaceMemberFieldMetadataId,
              workspaceMemberSubFieldName:
                predicate.workspaceMemberSubFieldName,
              rowLevelPermissionPredicateGroupId:
                predicate.rowLevelPermissionPredicateGroupId,
              positionInRowLevelPermissionPredicateGroup:
                predicate.positionInRowLevelPermissionPredicateGroup,
            })),
            predicateGroups: objectPredicateGroups.map((group) => ({
              id: group.id,
              objectMetadataId,
              parentRowLevelPermissionPredicateGroupId:
                group.parentRowLevelPermissionPredicateGroupId,
              logicalOperator: group.logicalOperator,
              positionInRowLevelPermissionPredicateGroup:
                group.positionInRowLevelPermissionPredicateGroup,
            })),
          },
        },
        refetchQueries: [getOperationName(GET_ROLES) ?? ''],
        awaitRefetchQueries: true,
      });
    }
  };

  const upsertRolePermissions = async ({
    snapshot,
    targetRoleId,
  }: {
    snapshot: RoleSaveSnapshot;
    targetRoleId: string;
  }) => {
    const {
      draftRole: settingsDraftRole,
      dirtyFields,
      fieldPermissionsToUpsert,
    } = snapshot;

    if (isDefined(dirtyFields.permissionFlags)) {
      await upsertPermissionFlags({
        variables: {
          upsertPermissionFlagsInput: {
            roleId: targetRoleId,
            permissionFlagKeys:
              settingsDraftRole.permissionFlags?.map(
                (permissionFlag) => permissionFlag.flag,
              ) ?? [],
          },
        },
        refetchQueries: [getOperationName(GET_ROLES) ?? ''],
      });
    }

    if (isDefined(dirtyFields.objectPermissions)) {
      await upsertObjectPermissions({
        variables: {
          upsertObjectPermissionsInput: {
            roleId: targetRoleId,
            objectPermissions:
              settingsDraftRole.objectPermissions?.map((objectPermission) => ({
                objectMetadataId: objectPermission.objectMetadataId,
                canReadObjectRecords: objectPermission.canReadObjectRecords,
                canUpdateObjectRecords: objectPermission.canUpdateObjectRecords,
                canSoftDeleteObjectRecords:
                  objectPermission.canSoftDeleteObjectRecords,
                canDestroyObjectRecords:
                  objectPermission.canDestroyObjectRecords,
              })) ?? [],
          },
        },
        refetchQueries: [getOperationName(GET_ROLES) ?? ''],
      });
    }

    if (isNonEmptyArray(fieldPermissionsToUpsert)) {
      await upsertFieldPermissions({
        variables: {
          upsertFieldPermissionsInput: {
            roleId: targetRoleId,
            fieldPermissions:
              fieldPermissionsToUpsert.map((fieldPermission) => ({
                objectMetadataId: fieldPermission.objectMetadataId,
                fieldMetadataId: fieldPermission.fieldMetadataId,
                canReadFieldValue: fieldPermission.canReadFieldValue,
                canUpdateFieldValue: fieldPermission.canUpdateFieldValue,
              })) ?? [],
          },
        },
        refetchQueries: [getOperationName(GET_ROLES) ?? ''],
      });
    }

    if (
      isDefined(dirtyFields.rowLevelPermissionPredicates) ||
      isDefined(dirtyFields.rowLevelPermissionPredicateGroups)
    ) {
      await upsertRowLevelPermissionPredicatesForRole({
        snapshot,
        targetRoleId,
      });
    }
  };

  const assignEntitiesToRole = async ({
    snapshot,
    targetRoleId,
  }: {
    snapshot: RoleSaveSnapshot;
    targetRoleId: string;
  }) => {
    const { draftRole: settingsDraftRole, dirtyFields } = snapshot;

    if (
      isDefined(dirtyFields.workspaceMembers) &&
      settingsDraftRole.canBeAssignedToUsers
    ) {
      await Promise.all(
        settingsDraftRole.workspaceMembers.map(({ id: workspaceMemberId }) =>
          updateWorkspaceMemberRole({
            variables: { roleId: targetRoleId, workspaceMemberId },
          }),
        ),
      );
    }

    if (
      isDefined(dirtyFields.agents) &&
      settingsDraftRole.canBeAssignedToAgents
    ) {
      await Promise.all(
        settingsDraftRole.agents.map(({ id: agentId }) =>
          assignRoleToAgent({ variables: { roleId: targetRoleId, agentId } }),
        ),
      );
    }

    if (
      isDefined(dirtyFields.apiKeys) &&
      settingsDraftRole.canBeAssignedToApiKeys
    ) {
      await Promise.all(
        settingsDraftRole.apiKeys.map(({ id: apiKeyId }) =>
          assignRoleToApiKey({ variables: { roleId: targetRoleId, apiKeyId } }),
        ),
      );
    }
  };

  const captureRoleSaveSubmissionOrThrow = (): RoleSaveSubmission => {
    const draftRole = store.get(
      settingsDraftRoleFamilyState.getAtom(roleId, routedFlowStateScopeId),
    );
    const roleBase = store.get(
      settingsDraftRoleBaseFamilyState.getAtom(roleId, routedFlowStateScopeId),
    );
    const currentPersistedRole = store.get(
      settingsPersistedRoleFamilyState.atomFamily(roleId),
    );
    const persistedRole = isCreateMode
      ? currentPersistedRole
      : (roleBase ?? currentPersistedRole);

    if (!isCreateMode && !isDefined(persistedRole)) {
      throw new CustomError(
        t`The role could not be loaded. Reload the page and try again.`,
      );
    }

    return { draftRole, persistedRole };
  };

  const saveDraftRoleToDB = async (
    submission: RoleSaveSubmission = captureRoleSaveSubmissionOrThrow(),
  ) => {
    const snapshot = buildRoleSaveSnapshotOrThrow(submission);
    const savedRoleId = snapshot.isCreateMode
      ? await createNewRole(snapshot)
      : await updateExistingRole(snapshot);

    if (isDefined(savedRoleId) && isDefined(onSuccess)) {
      await onSuccess(savedRoleId);
    }
  };

  return {
    saveDraftRoleToDB,
  };
};
