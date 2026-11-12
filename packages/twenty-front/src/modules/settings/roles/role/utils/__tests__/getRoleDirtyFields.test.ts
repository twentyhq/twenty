import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { getRoleDirtyFields } from '@/settings/roles/role/utils/getRoleDirtyFields';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import {
  type RowLevelPermissionPredicate,
  RowLevelPermissionPredicateOperand,
} from '~/generated-metadata/graphql';

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
});
