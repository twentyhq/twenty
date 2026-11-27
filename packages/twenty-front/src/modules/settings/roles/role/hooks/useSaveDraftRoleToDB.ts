import { useUpsertRowLevelPermissionRulesMutation } from '@/settings/roles/graphql/hooks/useUpsertRowLevelPermissionRulesMutation';
import { buildRowLevelPermissionRulesInput } from '@/settings/roles/role/utils/buildRowLevelPermissionRulesInput';
import { GET_ROLES } from '@/settings/roles/graphql/queries/getRolesQuery';
import { useUpdateAgentRole } from '@/settings/roles/hooks/useUpdateAgentRole';
import { useUpdateApiKeyRole } from '@/settings/roles/hooks/useUpdateApiKeyRole';
import { useUpdateWorkspaceMemberRole } from '@/settings/roles/hooks/useUpdateWorkspaceMemberRole';
import { getFieldPermissionsToUpsert } from '@/settings/roles/role/utils/getFieldPermissionsToUpsert';
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

    setSettingsPersistedRole(fetchedRole);

    return fetchedRole;
  };

  const dirtyFields = getRoleDirtyFields(draftRole, settingsPersistedRole);

  const fieldPermissionsToUpsert = getFieldPermissionsToUpsert({
    dirtyFieldPermissions: dirtyFields.fieldPermissions ?? [],
    persistedFieldPermissions: settingsPersistedRole?.fieldPermissions ?? [],
  });

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

  const shouldUpsertObjectPermissions = isDefined(
    dirtyFields.objectPermissions,
  );

  const shouldUpsertRowLevelPermissionRules =
    isDefined(dirtyFields.rowLevelPermissionRules) ||
    isDefined(dirtyFields.rowLevelPermissionPredicates) ||
    isDefined(dirtyFields.rowLevelPermissionPredicateGroups);

  const upsertObjectPermissionsForRole = async (targetRoleId: string) => {
    await upsertObjectPermissions({
      variables: {
        upsertObjectPermissionsInput: {
          roleId: targetRoleId,
          objectPermissions: (draftRole.objectPermissions ?? []).map(
            (objectPermission) => ({
              objectMetadataId: objectPermission.objectMetadataId,
              canReadObjectRecords: objectPermission.canReadObjectRecords,
              canUpdateObjectRecords: objectPermission.canUpdateObjectRecords,
              canSoftDeleteObjectRecords:
                objectPermission.canSoftDeleteObjectRecords,
              canDestroyObjectRecords: objectPermission.canDestroyObjectRecords,
            }),
          ),
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

    if (shouldUpsertObjectPermissions) {
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

    if (shouldUpsertRowLevelPermissionRules) {
      await upsertRowLevelPermissionRulesForRole(roleId);
    }

    return roleId;
  };

  const upsertRowLevelPermissionRulesForRole = async (targetRoleId: string) => {
    const rules = draftRole.rowLevelPermissionRules ?? [];
    const predicates = draftRole.rowLevelPermissionPredicates ?? [];
    const predicateGroups = draftRole.rowLevelPermissionPredicateGroups ?? [];

    const objectMetadataIds = new Set(
      [...rules, ...(settingsPersistedRole?.rowLevelPermissionRules ?? [])].map(
        ({ objectMetadataId }) => objectMetadataId,
      ),
    );

    for (const objectMetadataId of objectMetadataIds) {
      const isOfObject = (rowLevelPermissionItem: {
        objectMetadataId: string;
      }) => rowLevelPermissionItem.objectMetadataId === objectMetadataId;

      await upsertRowLevelPermissionRules({
        variables: {
          input: {
            roleId: targetRoleId,
            objectMetadataId,
            rules: buildRowLevelPermissionRulesInput({
              rules: rules.filter(isOfObject),
              predicates: predicates.filter(isOfObject),
              predicateGroups: predicateGroups.filter(isOfObject),
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

    if (shouldUpsertObjectPermissions) {
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

    if (shouldUpsertRowLevelPermissionRules) {
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
