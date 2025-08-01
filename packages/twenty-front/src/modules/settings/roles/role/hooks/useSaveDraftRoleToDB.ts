import { GET_ROLES } from '@/settings/roles/graphql/queries/getRolesQuery';
import { useUpdateWorkspaceMemberRole } from '@/settings/roles/hooks/useUpdateWorkspaceMemberRole';
import { useRemoveFieldPermissionInDraftRole } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useRemoveFieldPermissionInDraftRole';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { SettingsPath } from '@/types/SettingsPath';
import { getOperationName } from '@apollo/client/utilities';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  useCreateOneRoleMutation,
  useUpdateOneRoleMutation,
  useUpsertFieldPermissionsMutation,
  useUpsertObjectPermissionsMutation,
  useUpsertPermissionFlagsMutation,
} from '~/generated-metadata/graphql';
import { Role } from '~/generated/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getDirtyFields } from '~/utils/getDirtyFields';
import { isNonEmptyArray } from '~/utils/isNonEmptyArray';

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
];

export const useSaveDraftRoleToDB = ({
  roleId,
  isCreateMode,
}: {
  roleId: string;
  isCreateMode: boolean;
}) => {
  const [createRole] = useCreateOneRoleMutation();
  const [updateRole] = useUpdateOneRoleMutation();
  const [upsertPermissionFlags] = useUpsertPermissionFlagsMutation();
  const [upsertObjectPermissions] = useUpsertObjectPermissionsMutation();
  const [upsertFieldPermissions] = useUpsertFieldPermissionsMutation();
  const { addWorkspaceMembersToRole } = useUpdateWorkspaceMemberRole(roleId);
  const navigateSettings = useNavigateSettings();

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

  const fieldPermissionsToUpsert =
    dirtyFields.fieldPermissions?.filter(
      (dirtyFieldPermissionToFilter) =>
        !fieldPermissionsThatShouldntBeCreatedBecauseTheyAreUseless?.some(
          (fieldPermissionThatShouldntBeCreatedToFilter) =>
            dirtyFieldPermissionToFilter.fieldMetadataId ===
            fieldPermissionThatShouldntBeCreatedToFilter.fieldMetadataId,
        ),
    ) ?? [];

  const { removeFieldPermissionInDraftRole } =
    useRemoveFieldPermissionInDraftRole();

  const saveDraftRoleToDB = async () => {
    if (
      isNonEmptyArray(
        fieldPermissionsThatShouldntBeCreatedBecauseTheyAreUseless,
      )
    ) {
      for (const fieldPermissionToRemoveInDraftRole of fieldPermissionsThatShouldntBeCreatedBecauseTheyAreUseless) {
        removeFieldPermissionInDraftRole(
          roleId,
          fieldPermissionToRemoveInDraftRole.fieldMetadataId,
        );
      }
    }

    if (isCreateMode) {
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
          } satisfies Partial<Role>,
        },
        refetchQueries: [getOperationName(GET_ROLES) ?? ''],
      });

      if (!data) {
        return;
      }

      if (isDefined(dirtyFields.permissionFlags)) {
        await upsertPermissionFlags({
          variables: {
            upsertPermissionFlagsInput: {
              roleId: data.createOneRole.id,
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
              roleId: data.createOneRole.id,
              objectPermissions:
                settingsDraftRole.objectPermissions?.map(
                  (objectPermission) => ({
                    objectMetadataId: objectPermission.objectMetadataId,
                    canReadObjectRecords: objectPermission.canReadObjectRecords,
                    canUpdateObjectRecords:
                      objectPermission.canUpdateObjectRecords,
                    canSoftDeleteObjectRecords:
                      objectPermission.canSoftDeleteObjectRecords,
                    canDestroyObjectRecords:
                      objectPermission.canDestroyObjectRecords,
                  }),
                ) ?? [],
            },
          },
          refetchQueries: [getOperationName(GET_ROLES) ?? ''],
        });
      }

      if (isNonEmptyArray(fieldPermissionsToUpsert)) {
        await upsertFieldPermissions({
          variables: {
            upsertFieldPermissionsInput: {
              roleId: data.createOneRole.id,
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

      if (isDefined(dirtyFields.workspaceMembers)) {
        await addWorkspaceMembersToRole({
          roleId: data.createOneRole.id,
          workspaceMemberIds: settingsDraftRole.workspaceMembers.map(
            (member) => member.id,
          ),
        });
      }

      navigateSettings(SettingsPath.RoleDetail, {
        roleId: data.createOneRole.id,
      });
    } else {
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
                settingsDraftRole.objectPermissions?.map(
                  (objectPermission) => ({
                    objectMetadataId: objectPermission.objectMetadataId,
                    canReadObjectRecords: objectPermission.canReadObjectRecords,
                    canUpdateObjectRecords:
                      objectPermission.canUpdateObjectRecords,
                    canSoftDeleteObjectRecords:
                      objectPermission.canSoftDeleteObjectRecords,
                    canDestroyObjectRecords:
                      objectPermission.canDestroyObjectRecords,
                  }),
                ) ?? [],
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
    }
  };

  return {
    saveDraftRoleToDB,
  };
};
