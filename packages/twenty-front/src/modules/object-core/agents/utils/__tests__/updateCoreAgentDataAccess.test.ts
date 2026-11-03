import { CORE_AGENT_DATA_ACCESS_PERMISSIONS } from '@/object-core/agents/constants/CoreAgentDataAccessPermissions';
import { type CoreAgentDataAccessScope } from '@/object-core/agents/types/CoreAgentDataAccessScope';
import { updateCoreAgentDataAccess } from '@/object-core/agents/utils/updateCoreAgentDataAccess';
import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectLevelPermissionToRoleObjectPermissionMapping';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const role: RoleWithPartialMembers = {
  ...DEFAULT_SETTINGS_DRAFT_ROLE,
  id: 'agent-role',
  objectPermissions: [
    {
      objectMetadataId: 'company',
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      restrictedFields: { name: { canReadFieldValue: false } },
    },
  ],
  fieldPermissions: [
    {
      id: 'field-rule',
      objectMetadataId: 'company',
      fieldMetadataId: 'name',
      roleId: 'agent-role',
      canReadFieldValue: false,
      canUpdateFieldValue: false,
    },
  ],
  permissionFlags: [
    {
      id: 'settings-flag',
      roleId: 'agent-role',
      flag: PermissionFlagType.WORKSPACE,
    },
  ],
};
const scopes: CoreAgentDataAccessScope[] = [
  { type: 'global' },
  { type: 'object', objectMetadataId: 'company' },
];

it('requires reading for every write action and removes dependent writes at the same scope', () => {
  for (const scope of scopes) {
    for (const { key } of CORE_AGENT_DATA_ACCESS_PERMISSIONS.filter(
      ({ key }) => key !== 'canReadObjectRecords',
    )) {
      const granted = updateCoreAgentDataAccess({
        role: DEFAULT_SETTINGS_DRAFT_ROLE,
        scope,
        permissionKey: key,
        value: true,
      });
      const revoked = updateCoreAgentDataAccess({
        role: granted,
        scope,
        permissionKey: 'canReadObjectRecords',
        value: false,
      });

      if (scope.type === 'global') {
        expect(granted.canReadAllObjectRecords).toBe(true);
        expect(revoked.canReadAllObjectRecords).toBe(false);
        expect(
          revoked[
            SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING[
              key
            ]
          ],
        ).toBe(false);
        continue;
      }

      expect(granted.objectPermissions?.[0].canReadObjectRecords).toBe(true);
      expect(revoked.objectPermissions?.[0]).toMatchObject({
        canReadObjectRecords: false,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
      });
    }
  }
});

it('revokes an object grant explicitly instead of falling back to global access and preserves restrictions and unrelated flags', () => {
  const updated = updateCoreAgentDataAccess({
    role: {
      ...role,
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
    },
    scope: { type: 'object', objectMetadataId: 'company' },
    permissionKey: 'canUpdateObjectRecords',
    value: false,
  });

  expect(updated.objectPermissions?.[0]).toMatchObject({
    canReadObjectRecords: true,
    canUpdateObjectRecords: false,
    restrictedFields: role.objectPermissions?.[0].restrictedFields,
  });
  expect(updated.fieldPermissions).toBe(role.fieldPermissions);
  expect(updated.permissionFlags).toBe(role.permissionFlags);
  expect(updated.canUpdateAllObjectRecords).toBe(true);
});

it('keeps object overrides when a global grant changes and restores object inheritance without deleting restrictions', () => {
  const globalChange = updateCoreAgentDataAccess({
    role,
    scope: { type: 'global' },
    permissionKey: 'canReadObjectRecords',
    value: false,
  });
  const inherited = updateCoreAgentDataAccess({
    role,
    scope: { type: 'object', objectMetadataId: 'company' },
    permissionKey: 'canUpdateObjectRecords',
    value: null,
  });

  expect(globalChange.objectPermissions).toBe(role.objectPermissions);
  expect(inherited.objectPermissions?.[0]).toMatchObject({
    canReadObjectRecords: null,
    canUpdateObjectRecords: null,
    restrictedFields: role.objectPermissions?.[0].restrictedFields,
  });
  expect(inherited.fieldPermissions).toBe(role.fieldPermissions);
});
