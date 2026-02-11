import { useUpsertRowLevelPermissionPredicatesMutation } from '@/settings/roles/graphql/hooks/useUpsertRowLevelPermissionPredicatesMutation';
import { GET_ROLES } from '@/settings/roles/graphql/queries/getRolesQuery';
import { useUpdateAgentRole } from '@/settings/roles/hooks/useUpdateAgentRole';
import { useUpdateApiKeyRole } from '@/settings/roles/hooks/useUpdateApiKeyRole';
import { useUpdateWorkspaceMemberRole } from '@/settings/roles/hooks/useUpdateWorkspaceMemberRole';
import { useRemoveFieldPermissionInDraftRole } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useRemoveFieldPermissionInDraftRole';
import { newFieldPermissionsFilter } from '@/settings/roles/role/hooks/utils/newFieldPermissionsFilter.util';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { getOperationName } from '@apollo/client/utilities';
import { useRecoilValue } from 'recoil';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import {
  type RowLevelPermissionPredicateGroupLogicalOperator,
  type RowLevelPermissionPredicateOperand,
  useCreateOneRoleMutation,
  useUpdateOneRoleMutation,
  useUpsertFieldPermissionsMutation,
  useUpsertObjectPermissionsMutation,
  useUpsertPermissionFlagsMutation,
  type Role,
} from '~/generated-metadata/graphql';
import { getDirtyFields } from '~/utils/getDirtyFields';

const ROLE_BASIC_KEYS: Array<keyof Role> = [
  'label',
  'description',
  'icon',
  'canUpdateAllSettings',
  'canAccessAllTools',
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
  const [createRole] = useCreateOneRoleMutation();
  const [updateRole] = useUpdateOneRoleMutation();
  const [upsertPermissionFlags] = useUpsertPermissionFlagsMutation();
  const [upsertObjectPermissions] = useUpsertObjectPermissionsMutation();
  const [upsertFieldPermissions] = useUpsertFieldPermissionsMutation();
  const [upsertRowLevelPermissionPredicates] =
    useUpsertRowLevelPermissionPredicatesMutation();
  const { addWorkspaceMembersToRole } = useUpdateWorkspaceMemberRole(roleId);
  const { addAgentsToRole } = useUpdateAgentRole(roleId);
  const { addApiKeysToRole } = useUpdateApiKeyRole(roleId);

  const settingsPersistedRole = useRecoilValue(
    settingsPersistedRoleFamilyState(roleId),
  );

  const settingsDraftRole = useRecoilValue(
    settingsDraftRoleFamilyState(roleId),
  );

  const dirtyFields = getDirtyFields(settingsDraftRole, settingsPersistedRole);

  const fieldPermissionsThatShouldntBeCreatedBecauseTheyAreUseless =
    settingsDraftRole.fieldPermissions?.filter((fieldPermissionToFilter) => {
      const fieldPermissionDoesntExistYetInPersistedFieldPermissions =
        !settingsPersistedRole?.fieldPermissions?.some(
          (persistedFieldPermissionToFilter) =>
            persistedFieldPermissionToFilter.fieldMetadataId ===
            fieldPermissionToFilter.fieldMetadataId,
        );

      return (
        fieldPermissionToFilter.canReadFieldValue !== false &&
        fieldPermissionToFilter.canUpdateFieldValue !== false &&
        fieldPermissionDoesntExistYetInPersistedFieldPermissions
      );
    });

  const onlyMeaningfulFieldPermissions =
    dirtyFields.fieldPermissions?.filter(
      (dirtyFieldPermissionToFilter) =>
        !fieldPermissionsThatShouldntBeCreatedBecauseTheyAreUseless?.some(
          (fieldPermissionThatShouldntBeCreatedToFilter) =>
            dirtyFieldPermissionToFilter.fieldMetadataId ===
            fieldPermissionThatShouldntBeCreatedToFilter.fieldMetadataId,
        ),
    ) ?? [];

  const fieldPermissionsToUpsert = onlyMeaningfulFieldPermissions.filter(
    (dirtyFieldPermission) =>
      newFieldPermissionsFilter(
        dirtyFieldPermission,
        settingsPersistedRole?.fieldPermissions,
      ),
  );

  const { removeFieldPermissionInDraftRole } =
    useRemoveFieldPermissionInDraftRole();

  const removeUselessFieldPermissions = () => {
    if (
      isNonEmptyArray(
        fieldPermissionsThatShouldntBeCreatedBecauseTheyAreUseless,
      ) === true
    ) {
      for (const fieldPermissionToRemoveInDraftRole of fieldPermissionsThatShouldntBeCreatedBecauseTheyAreUseless) {
        removeFieldPermissionInDraftRole(
          roleId,
          fieldPermissionToRemoveInDraftRole.fieldMetadataId,
        );
      }
    }
  };

  const createNewRole = async () => {
    const { data } = await createRole({
      variables: {
        createRoleInput: {
          id: roleId,
          label: settingsDraftRole.label,
          description: settingsDraftRole.description,
          icon: settingsDraftRole.icon,
          canUpdateAllSettings: settingsDraftRole.canUpdateAllSettings,
          canAccessAllTools: settingsDraftRole.canAccessAllTools,
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

    await upsertRolePermissions(createdRoleId);
    await assignEntitiesToRole(createdRoleId);

    if (isDefined(onSuccess)) {
      await onSuccess(createdRoleId);
    }
  };

  const updateExistingRole = async () => {
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

    if (isNonEmptyArray(fieldPermissionsToUpsert) === true) {
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
      await upsertRowLevelPermissionPredicatesForRole(roleId);
    }
  };

  const upsertRowLevelPermissionPredicatesForRole = async (
    targetRoleId: string,
  ) => {
    const predicates = settingsDraftRole.rowLevelPermissionPredicates ?? [];
    const predicateGroups =
      settingsDraftRole.rowLevelPermissionPredicateGroups ?? [];

    const predicatesByObject = predicates.reduce(
      (acc, predicate) => {
        const objectMetadataId = predicate.objectMetadataId;

        if (!acc[objectMetadataId]) {
          acc[objectMetadataId] = [];
        }
        acc[objectMetadataId].push(predicate);

        return acc;
      },
      {} as Record<string, typeof predicates>,
    );

    const persistedPredicates =
      settingsPersistedRole?.rowLevelPermissionPredicates ?? [];
    const persistedObjectIds = new Set(
      persistedPredicates.map((predicate) => predicate.objectMetadataId),
    );

    for (const objectMetadataId of persistedObjectIds) {
      if (!predicatesByObject[objectMetadataId]) {
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
              operand: predicate.operand as RowLevelPermissionPredicateOperand,
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
              logicalOperator:
                group.logicalOperator as RowLevelPermissionPredicateGroupLogicalOperator,
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

  const upsertRolePermissions = async (targetRoleId: string) => {
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

    if (isNonEmptyArray(fieldPermissionsToUpsert) === true) {
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
      await upsertRowLevelPermissionPredicatesForRole(targetRoleId);
    }
  };

  const assignEntitiesToRole = async (targetRoleId: string) => {
    if (
      isDefined(dirtyFields.workspaceMembers) &&
      settingsDraftRole.canBeAssignedToUsers
    ) {
      await addWorkspaceMembersToRole({
        roleId: targetRoleId,
        workspaceMemberIds: settingsDraftRole.workspaceMembers.map(
          (member) => member.id,
        ),
      });
    }

    if (
      isDefined(dirtyFields.agents) &&
      settingsDraftRole.canBeAssignedToAgents
    ) {
      await addAgentsToRole({
        roleId: targetRoleId,
        agentIds: settingsDraftRole.agents.map((agent) => agent.id),
      });
    }

    if (
      isDefined(dirtyFields.apiKeys) &&
      settingsDraftRole.canBeAssignedToApiKeys
    ) {
      await addApiKeysToRole({
        roleId: targetRoleId,
        apiKeyIds: settingsDraftRole.apiKeys.map((apiKey) => apiKey.id),
      });
    }

    if (isDefined(onSuccess)) {
      await onSuccess(roleId);
    }
  };

  const saveDraftRoleToDB = async () => {
    removeUselessFieldPermissions();

    if (isCreateMode) {
      await createNewRole();
    } else {
      await updateExistingRole();
    }
  };

  return {
    saveDraftRoleToDB,
  };
};
