import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { getRoleDirtyFields } from '@/settings/roles/role/utils/getRoleDirtyFields';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import {
  type RowLevelPermissionPredicate,
  RowLevelPermissionPredicateOperand,
} from '~/generated-metadata/graphql';
import { mockedRoles } from '~/testing/mock-data/generated/metadata/roles/mock-roles-data';

const role = { ...mockedRoles[1], permissionFlags: [] };
const draftFlag = {
  id: 'temporary-id',
  roleId: role.id,
  flag: 'APP_SEND_NOTIFICATION',
};
const draftRole = { ...role, permissionFlags: [draftFlag] };
const savedRole = {
  ...role,
  permissionFlags: [
    {
      ...draftFlag,
      id: 'server-id',
      __typename: 'RolePermissionFlag' as const,
    },
  ],
};

const PREDICATE: RowLevelPermissionPredicate = {
  __typename: 'RowLevelPermissionPredicate',
  id: 'predicate-id',
  fieldMetadataId: 'field-id',
  objectMetadataId: 'pet',
  operand: RowLevelPermissionPredicateOperand.IS,
  roleId: 'role-id',
  value: '3',
};

const ROLE: RoleWithPartialMembers = {
  ...DEFAULT_SETTINGS_DRAFT_ROLE,
  id: 'role-id',
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
};

describe('getRoleDirtyFields', () => {
  it('treats saved flags as clean despite generated IDs and GraphQL metadata', () => {
    expect(getRoleDirtyFields(draftRole, savedRole)).toEqual({});
  });

  it('ignores flag ordering without modifying either role', () => {
    const otherFlag = { ...draftFlag, id: 'other-id', flag: 'APP_CONFIGURE' };
    const draft = { ...role, permissionFlags: [draftFlag, otherFlag] };
    const persisted = { ...role, permissionFlags: [otherFlag, draftFlag] };

    expect(getRoleDirtyFields(draft, persisted)).toEqual({});
    expect(draft.permissionFlags).toEqual([draftFlag, otherFlag]);
    expect(persisted.permissionFlags).toEqual([otherFlag, draftFlag]);
  });

  it('keeps additions made during a save dirty until they are undone', () => {
    const otherFlag = { ...draftFlag, id: 'other-id', flag: 'APP_CONFIGURE' };
    const draft = { ...draftRole, permissionFlags: [draftFlag, otherFlag] };

    expect(getRoleDirtyFields(draft, savedRole)).toEqual({
      permissionFlags: draft.permissionFlags,
    });
    expect(getRoleDirtyFields(draftRole, savedRole)).toEqual({});
  });

  it('detects flag removals and replacements', () => {
    expect(getRoleDirtyFields(role, savedRole)).toEqual({
      permissionFlags: [],
    });
    const replacement = { ...draftFlag, flag: 'APP_CONFIGURE' };
    expect(
      getRoleDirtyFields(
        { ...role, permissionFlags: [replacement] },
        savedRole,
      ),
    ).toEqual({ permissionFlags: [replacement] });
  });

  it('keeps failed flag changes and unrelated edits dirty', () => {
    expect(getRoleDirtyFields(draftRole, role)).toEqual({
      permissionFlags: [draftFlag],
    });
    expect(
      getRoleDirtyFields({ ...draftRole, label: 'Unsaved label' }, savedRole),
    ).toEqual({ label: 'Unsaved label' });
  });

  it('retains new-role fields when there is no persisted role', () => {
    expect(getRoleDirtyFields(draftRole, undefined)).toEqual(draftRole);
  });

  it('should not report a saved rule as a change', () => {
    const draftRole: RoleWithPartialMembers = {
      ...ROLE,
      objectPermissions: [
        {
          objectMetadataId: 'pet',
          canReadObjectRecords: true,
          canUpdateObjectRecords: false,
        },
      ],
      rowLevelPermissionPredicates: [PREDICATE],
    };

    const persistedRole: RoleWithPartialMembers = {
      ...ROLE,
      objectPermissions: [
        {
          objectMetadataId: 'pet',
          canReadObjectRecords: null,
          canUpdateObjectRecords: false,
        },
      ],
      rowLevelPermissionPredicates: [
        { ...PREDICATE, relationFieldMetadataId: null },
      ],
      rowLevelPermissionRules: [
        {
          __typename: 'RowLevelPermissionRule',
          id: 'rule-id',
          objectMetadataId: 'pet',
          canCreateRecords: false,
          canReadRecords: true,
          canUpdateRecords: false,
          canSoftDeleteRecords: false,
          canDestroyRecords: false,
        },
      ],
    };

    expect(getRoleDirtyFields(draftRole, persistedRole)).toEqual({});
  });

  it('should report a grant changed on an object with a rule', () => {
    const persistedRole: RoleWithPartialMembers = {
      ...ROLE,
      rowLevelPermissionPredicates: [PREDICATE],
    };

    const draftRole: RoleWithPartialMembers = {
      ...persistedRole,
      objectPermissions: [
        { objectMetadataId: 'pet', canUpdateObjectRecords: false },
      ],
    };

    expect(Object.keys(getRoleDirtyFields(draftRole, persistedRole))).toEqual([
      'objectPermissions',
    ]);
  });

  it('should not report a saved field restriction as a change', () => {
    const buildRole = (fieldPermissionId: string): RoleWithPartialMembers => ({
      ...ROLE,
      fieldPermissions: [
        {
          __typename: 'FieldPermission',
          id: fieldPermissionId,
          roleId: 'role-id',
          objectMetadataId: 'pet',
          fieldMetadataId: 'age',
          canReadFieldValue: null,
          canUpdateFieldValue: false,
        },
      ],
    });

    expect(
      getRoleDirtyFields(buildRole('draft-id'), buildRole('saved-id')),
    ).toEqual({});
  });

  it('should not report object permissions listed in another order', () => {
    const companyPermission = {
      objectMetadataId: 'company',
      canReadObjectRecords: false,
    };
    const personPermission = {
      objectMetadataId: 'person',
      canUpdateObjectRecords: false,
    };

    expect(
      getRoleDirtyFields(
        { ...ROLE, objectPermissions: [personPermission, companyPermission] },
        { ...ROLE, objectPermissions: [companyPermission, personPermission] },
      ),
    ).toEqual({});
  });
});
