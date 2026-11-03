import { mergeCoreAgentPermissionCollectionIntent } from '@/object-core/agents/utils/mergeCoreAgentPermissionCollectionIntent';
import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { isDefined } from 'twenty-shared/utils';
import { getRoleDirtyFields } from '@/settings/roles/role/utils/getRoleDirtyFields';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

export const applyCoreAgentPermissionIntent = ({
  draftRole,
  baseRole,
  assignedRole,
  submittedRole,
}: {
  draftRole: RoleWithPartialMembers;
  baseRole: RoleWithPartialMembers | undefined;
  assignedRole: RoleWithPartialMembers;
  submittedRole?: RoleWithPartialMembers;
}) => {
  const dirtyFields = {
    ...getRoleDirtyFields({
      draftRole,
      persistedRole: baseRole ?? DEFAULT_SETTINGS_DRAFT_ROLE,
    }),
    ...(isDefined(submittedRole)
      ? getRoleDirtyFields({ draftRole, persistedRole: submittedRole })
      : {}),
  };
  const nextRole = { ...assignedRole };
  const applyField = <TField extends keyof RoleWithPartialMembers>(
    field: TField,
  ) => {
    if (field in dirtyFields) {
      nextRole[field] = draftRole[field];
    }
  };

  for (const field of [
    'canReadAllObjectRecords',
    'canUpdateAllObjectRecords',
    'canSoftDeleteAllObjectRecords',
    'canDestroyAllObjectRecords',
    'canUpdateAllSettings',
    'canAccessAllTools',
    'canAccessAllAgentChatChannels',
    'permissionFlags',
    'objectPermissions',
    'fieldPermissions',
    'rowLevelPermissionPredicates',
    'rowLevelPermissionPredicateGroups',
  ] as const) {
    applyField(field);
  }

  if (!isDefined(baseRole)) {
    nextRole.permissionFlags = mergeCoreAgentPermissionCollectionIntent({
      assignedPermissions: assignedRole.permissionFlags ?? [],
      draftPermissions: draftRole.permissionFlags ?? [],
      submittedPermissions: submittedRole?.permissionFlags ?? [],
      uniqueKey: 'flag',
      isEdited: 'permissionFlags' in dirtyFields,
    });
    nextRole.objectPermissions = mergeCoreAgentPermissionCollectionIntent({
      assignedPermissions: assignedRole.objectPermissions ?? [],
      draftPermissions: draftRole.objectPermissions ?? [],
      submittedPermissions: submittedRole?.objectPermissions ?? [],
      uniqueKey: 'objectMetadataId',
      isEdited: 'objectPermissions' in dirtyFields,
    });
    nextRole.fieldPermissions = mergeCoreAgentPermissionCollectionIntent({
      assignedPermissions: assignedRole.fieldPermissions ?? [],
      draftPermissions: draftRole.fieldPermissions ?? [],
      submittedPermissions: submittedRole?.fieldPermissions ?? [],
      uniqueKey: 'fieldMetadataId',
      isEdited: 'fieldPermissions' in dirtyFields,
    });
    nextRole.rowLevelPermissionPredicates =
      mergeCoreAgentPermissionCollectionIntent({
        assignedPermissions: assignedRole.rowLevelPermissionPredicates ?? [],
        draftPermissions: draftRole.rowLevelPermissionPredicates ?? [],
        submittedPermissions: submittedRole?.rowLevelPermissionPredicates ?? [],
        uniqueKey: 'id',
        isEdited: 'rowLevelPermissionPredicates' in dirtyFields,
      });
    nextRole.rowLevelPermissionPredicateGroups =
      mergeCoreAgentPermissionCollectionIntent({
        assignedPermissions:
          assignedRole.rowLevelPermissionPredicateGroups ?? [],
        draftPermissions: draftRole.rowLevelPermissionPredicateGroups ?? [],
        submittedPermissions:
          submittedRole?.rowLevelPermissionPredicateGroups ?? [],
        uniqueKey: 'id',
        isEdited: 'rowLevelPermissionPredicateGroups' in dirtyFields,
      });
  }

  return nextRole;
};
