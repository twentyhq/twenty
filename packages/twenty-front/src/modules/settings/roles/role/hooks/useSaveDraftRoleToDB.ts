import { useUpsertRowLevelPermissionRulesMutation } from '@/settings/roles/graphql/hooks/useUpsertRowLevelPermissionRulesMutation';
import { buildRowLevelPermissionRulesInput } from '@/settings/roles/role/utils/buildRowLevelPermissionRulesInput';
import { GET_ROLES } from '@/settings/roles/graphql/queries/getRolesQuery';
import { useUpdateAgentRole } from '@/settings/roles/hooks/useUpdateAgentRole';
import { useUpdateApiKeyRole } from '@/settings/roles/hooks/useUpdateApiKeyRole';
import { useUpdateWorkspaceMemberRole } from '@/settings/roles/hooks/useUpdateWorkspaceMemberRole';
import { newFieldPermissionsFilter } from '@/settings/roles/role/utils/newFieldPermissionsFilter';
import { withRowLevelPermissionRuleGrants } from '@/settings/roles/role/utils/withRowLevelPermissionRuleGrants';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { getOperationName } from '~/utils/getOperationName';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { useApolloClient, useMutation } from '@apollo/client/react';
import {
  type Role,
  CreateOneRoleDocument,
  GetRolesDocument,
  UpdateOneRoleDocument,
  UpsertFieldPermissionsDocument,
  UpsertObjectPermissionsDocument,
  UpsertPermissionFlagsDocument,
} from '~/generated-metadata/graphql';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { getRoleDirtyFields } from '@/settings/roles/role/utils/getRoleDirtyFields';
import { resolveSettingsRoleObjectRecordsGrant } from '@/settings/roles/role/utils/resolveSettingsRoleObjectRecordsGrant';

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

const ALL_OBJECT_RECORDS_GRANT_KEYS: Array<keyof Role> = [
  'canReadAllObjectRecords',
  'canUpdateAllObjectRecords',
  'canSoftDeleteAllObjectRecords',
  'canDestroyAllObjectRecords',
];

export const useSaveDraftRoleToDB = ({
  roleId,
  isCreateMode,
  draftRole,
  onSuccess,
}: {
  roleId: string;
  isCreateMode: boolean;
  draftRole: RoleWithPartialMembers;
  onSuccess?: (savedRoleId: string) => void | Promise<void>;
}) => {
  const [createRole] = useMutation(CreateOneRoleDocument);
  const [updateRole] = useMutation(UpdateOneRoleDocument);
  const [upsertPermissionFlags] = useMutation(UpsertPermissionFlagsDocument);
  const [upsertObjectPermissions] = useMutation(
    UpsertObjectPermissionsDocument,
  );
  const [upsertFieldPermissions] = useMutation(UpsertFieldPermissionsDocument);
  const [upsertRowLevelPermissionRules] =
    useUpsertRowLevelPermissionRulesMutation();
  const { addWorkspaceMembersToRole } = useUpdateWorkspaceMemberRole(roleId);
  const { addAgentsToRole } = useUpdateAgentRole(roleId);
  const { addApiKeysToRole } = useUpdateApiKeyRole(roleId);

  const settingsPersistedRole = useAtomFamilyStateValue(
    settingsPersistedRoleFamilyState,
    roleId,
  );

  const apolloClient = useApolloClient();
  const setSettingsPersistedRole = useSetAtomFamilyState(
    settingsPersistedRoleFamilyState,
    roleId,
  );

  const refreshPersistedRole = async () => {
    const { data } = await apolloClient.query({
      query: GetRolesDocument,
      fetchPolicy: 'network-only',
    });
    const fetchedRole = data?.getRoles.find((role) => role.id === roleId);

    if (!isDefined(fetchedRole)) {
      throw new Error(doNotTranslate('Saved role not found'));
    }

    const savedRole = withRowLevelPermissionRuleGrants(fetchedRole);

    setSettingsPersistedRole(savedRole);

    return savedRole;
  };

  const dirtyFields = getRoleDirtyFields(draftRole, settingsPersistedRole);

  const fieldPermissionsThatShouldntBeCreatedBecauseTheyAreUseless =
    draftRole.fieldPermissions?.filter((fieldPermissionToFilter) => {
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

  const createNewRole = async () => {
    const { data } = await createRole({
      variables: {
        createRoleInput: {
          id: roleId,
          label: draftRole.label,
          description: draftRole.description,
          icon: draftRole.icon,
          canUpdateAllSettings: draftRole.canUpdateAllSettings,
          canAccessAllTools: draftRole.canAccessAllTools,
          canAccessAllAgentChatChannels:
            draftRole.canAccessAllAgentChatChannels,
          canReadAllObjectRecords: draftRole.canReadAllObjectRecords,
          canUpdateAllObjectRecords: draftRole.canUpdateAllObjectRecords,
          canSoftDeleteAllObjectRecords:
            draftRole.canSoftDeleteAllObjectRecords,
          canDestroyAllObjectRecords: draftRole.canDestroyAllObjectRecords,
          canBeAssignedToUsers: draftRole.canBeAssignedToUsers,
          canBeAssignedToAgents: draftRole.canBeAssignedToAgents,
          canBeAssignedToApiKeys: draftRole.canBeAssignedToApiKeys,
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

    return createdRoleId;
  };

  const rowLevelPermissionObjectMetadataIds = new Set(
    (draftRole.rowLevelPermissionPredicates ?? []).map(
      ({ objectMetadataId }) => objectMetadataId,
    ),
  );
  const persistedRowLevelPermissionObjectMetadataIds = new Set(
    (settingsPersistedRole?.rowLevelPermissionPredicates ?? []).map(
      ({ objectMetadataId }) => objectMetadataId,
    ),
  );

  // Rules carry the grant of a filtered object, so a change to either side rewrites both
  const shouldSyncObjectRecordsGrants =
    isDefined(dirtyFields.objectPermissions) ||
    isDefined(dirtyFields.rowLevelPermissionPredicates) ||
    isDefined(dirtyFields.rowLevelPermissionPredicateGroups) ||
    (rowLevelPermissionObjectMetadataIds.size > 0 &&
      ALL_OBJECT_RECORDS_GRANT_KEYS.some((key) => key in dirtyFields));

  const upsertObjectPermissionsForRole = async (targetRoleId: string) => {
    const objectMetadataIdsToResolve = [
      ...new Set([
        ...rowLevelPermissionObjectMetadataIds,
        ...persistedRowLevelPermissionObjectMetadataIds,
      ]),
    ];

    await upsertObjectPermissions({
      variables: {
        upsertObjectPermissionsInput: {
          roleId: targetRoleId,
          objectPermissions: [
            ...(draftRole.objectPermissions ?? [])
              .filter(
                ({ objectMetadataId }) =>
                  !objectMetadataIdsToResolve.includes(objectMetadataId),
              )
              .map((objectPermission) => ({
                objectMetadataId: objectPermission.objectMetadataId,
                canReadObjectRecords: objectPermission.canReadObjectRecords,
                canUpdateObjectRecords: objectPermission.canUpdateObjectRecords,
                canSoftDeleteObjectRecords:
                  objectPermission.canSoftDeleteObjectRecords,
                canDestroyObjectRecords:
                  objectPermission.canDestroyObjectRecords,
              })),
            ...objectMetadataIdsToResolve.map((objectMetadataId) => {
              if (rowLevelPermissionObjectMetadataIds.has(objectMetadataId)) {
                return {
                  objectMetadataId,
                  canReadObjectRecords: false,
                  canUpdateObjectRecords: false,
                  canSoftDeleteObjectRecords: false,
                  canDestroyObjectRecords: false,
                };
              }

              const objectPermission = draftRole.objectPermissions?.find(
                (draftObjectPermission) =>
                  draftObjectPermission.objectMetadataId === objectMetadataId,
              );

              return {
                objectMetadataId,
                canReadObjectRecords:
                  objectPermission?.canReadObjectRecords ?? null,
                canUpdateObjectRecords:
                  objectPermission?.canUpdateObjectRecords ?? null,
                canSoftDeleteObjectRecords:
                  objectPermission?.canSoftDeleteObjectRecords ?? null,
                canDestroyObjectRecords:
                  objectPermission?.canDestroyObjectRecords ?? null,
              };
            }),
          ],
        },
      },
      refetchQueries: [getOperationName(GET_ROLES) ?? ''],
    });
  };

  const updateExistingRole = async () => {
    if (isDefined(dirtyFields.permissionFlags)) {
      await upsertPermissionFlags({
        variables: {
          upsertPermissionFlagsInput: {
            roleId: roleId,
            permissionFlagKeys:
              draftRole.permissionFlags?.map(
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
              label: draftRole.label,
              description: draftRole.description,
              icon: draftRole.icon,
              canUpdateAllSettings: draftRole.canUpdateAllSettings,
              canAccessAllTools: draftRole.canAccessAllTools,
              canAccessAllAgentChatChannels:
                draftRole.canAccessAllAgentChatChannels,
              canReadAllObjectRecords: draftRole.canReadAllObjectRecords,
              canUpdateAllObjectRecords: draftRole.canUpdateAllObjectRecords,
              canSoftDeleteAllObjectRecords:
                draftRole.canSoftDeleteAllObjectRecords,
              canDestroyAllObjectRecords: draftRole.canDestroyAllObjectRecords,
              canBeAssignedToUsers: draftRole.canBeAssignedToUsers,
              canBeAssignedToAgents: draftRole.canBeAssignedToAgents,
              canBeAssignedToApiKeys: draftRole.canBeAssignedToApiKeys,
            },
          },
        },
        refetchQueries: [getOperationName(GET_ROLES) ?? ''],
      });
    }

    if (shouldSyncObjectRecordsGrants) {
      await upsertObjectPermissionsForRole(roleId);
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

    if (shouldSyncObjectRecordsGrants) {
      await upsertRowLevelPermissionRulesForRole(roleId);
    }

    return roleId;
  };

  const upsertRowLevelPermissionRulesForRole = async (targetRoleId: string) => {
    const predicates = draftRole.rowLevelPermissionPredicates ?? [];
    const predicateGroups = draftRole.rowLevelPermissionPredicateGroups ?? [];

    const predicatesByObject = predicates.reduce(
      (acc, predicate) => {
        const objectMetadataId = predicate.objectMetadataId;

        if (!isDefined(acc[objectMetadataId])) {
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

      const objectRecordsGrant = resolveSettingsRoleObjectRecordsGrant({
        role: draftRole,
        objectMetadataId,
      });
      const persistedRule = (
        settingsPersistedRole?.rowLevelPermissionRules ?? []
      ).find((rule) => rule.objectMetadataId === objectMetadataId);

      await upsertRowLevelPermissionRules({
        variables: {
          input: {
            roleId: targetRoleId,
            objectMetadataId,
            rules: buildRowLevelPermissionRulesInput({
              predicates: objectPredicates,
              predicateGroups: objectPredicateGroups,
              ruleOperations: {
                ...objectRecordsGrant,
                canCreateRecords:
                  persistedRule?.canCreateRecords ??
                  objectRecordsGrant.canUpdateRecords,
              },
            }),
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
              draftRole.permissionFlags?.map(
                (permissionFlag) => permissionFlag.flag,
              ) ?? [],
          },
        },
        refetchQueries: [getOperationName(GET_ROLES) ?? ''],
      });
    }

    if (shouldSyncObjectRecordsGrants) {
      await upsertObjectPermissionsForRole(targetRoleId);
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

    if (shouldSyncObjectRecordsGrants) {
      await upsertRowLevelPermissionRulesForRole(targetRoleId);
    }
  };

  const assignEntitiesToRole = async (targetRoleId: string) => {
    if (
      isDefined(dirtyFields.workspaceMembers) &&
      draftRole.canBeAssignedToUsers
    ) {
      await addWorkspaceMembersToRole({
        roleId: targetRoleId,
        workspaceMemberIds: draftRole.workspaceMembers.map(
          (member) => member.id,
        ),
      });
    }

    if (isDefined(dirtyFields.agents) && draftRole.canBeAssignedToAgents) {
      await addAgentsToRole({
        roleId: targetRoleId,
        agentIds: draftRole.agents.map((agent) => agent.id),
      });
    }

    if (isDefined(dirtyFields.apiKeys) && draftRole.canBeAssignedToApiKeys) {
      await addApiKeysToRole({
        roleId: targetRoleId,
        apiKeyIds: draftRole.apiKeys.map((apiKey) => apiKey.id),
      });
    }
  };

  const saveDraftRoleToDB = async () => {
    const savedRoleId = isCreateMode
      ? await createNewRole()
      : await updateExistingRole();

    if (!isDefined(savedRoleId)) {
      return;
    }

    if (isDefined(onSuccess)) {
      await onSuccess(savedRoleId);
    }

    return refreshPersistedRole();
  };

  return {
    saveDraftRoleToDB,
  };
};
