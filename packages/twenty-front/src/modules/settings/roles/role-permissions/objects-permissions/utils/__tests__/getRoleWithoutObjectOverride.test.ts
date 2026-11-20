import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { getRoleWithoutObjectOverride } from '@/settings/roles/role-permissions/objects-permissions/utils/getRoleWithoutObjectOverride';
import {
  type FieldPermission,
  type ObjectPermission,
  RowLevelPermissionPredicateGroupLogicalOperator,
  type RowLevelPermissionPredicateGroup,
  type RowLevelPermissionRule,
} from '~/generated-metadata/graphql';

const buildObjectPermission = (objectMetadataId: string): ObjectPermission => ({
  objectMetadataId,
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
});

const buildFieldPermission = ({
  id,
  objectMetadataId,
  groupId = null,
}: {
  id: string;
  objectMetadataId: string;
  groupId?: string | null;
}): FieldPermission => ({
  id,
  roleId: 'role-id',
  objectMetadataId,
  fieldMetadataId: `${id}-field-id`,
  canReadFieldValue: false,
  canUpdateFieldValue: false,
  rowLevelPermissionPredicateGroupId: groupId,
});

const buildRule = (
  id: string,
  objectMetadataId: string,
): RowLevelPermissionRule => ({
  id,
  objectMetadataId,
  canReadRecords: true,
  canCreateRecords: false,
  canUpdateRecords: false,
  canSoftDeleteRecords: false,
  canDestroyRecords: false,
});

const buildPredicateGroup = (
  id: string,
  ruleId: string,
  objectMetadataId: string,
): RowLevelPermissionPredicateGroup => ({
  id,
  roleId: 'role-id',
  objectMetadataId,
  rowLevelPermissionRuleId: ruleId,
  parentRowLevelPermissionPredicateGroupId: null,
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
  positionInRowLevelPermissionPredicateGroup: null,
  canReadRecords: true,
  canUpdateRecords: false,
  canSoftDeleteRecords: false,
  canDestroyRecords: false,
});

describe('getRoleWithoutObjectOverride', () => {
  it('should reset the object, its field permissions and drop its rules only', () => {
    const role = getRoleWithoutObjectOverride({
      role: {
        ...DEFAULT_SETTINGS_DRAFT_ROLE,
        objectPermissions: [
          buildObjectPermission('company'),
          buildObjectPermission('person'),
        ],
        fieldPermissions: [
          buildFieldPermission({ id: 'company', objectMetadataId: 'company' }),
          buildFieldPermission({
            id: 'company-rule',
            objectMetadataId: 'company',
            groupId: 'company-group',
          }),
          buildFieldPermission({ id: 'person', objectMetadataId: 'person' }),
        ],
        rowLevelPermissionRules: [
          buildRule('company-rule', 'company'),
          buildRule('person-rule', 'person'),
        ],
        rowLevelPermissionPredicateGroups: [
          buildPredicateGroup('company-group', 'company-rule', 'company'),
          buildPredicateGroup('person-group', 'person-rule', 'person'),
        ],
      },
      objectMetadataId: 'company',
    });

    expect(role.objectPermissions).toEqual([
      {
        objectMetadataId: 'company',
        canReadObjectRecords: null,
        canUpdateObjectRecords: null,
        canSoftDeleteObjectRecords: null,
        canDestroyObjectRecords: null,
      },
      buildObjectPermission('person'),
    ]);
    expect(
      role.fieldPermissions?.map(
        ({ id, canReadFieldValue, canUpdateFieldValue }) => ({
          id,
          canReadFieldValue,
          canUpdateFieldValue,
        }),
      ),
    ).toEqual([
      { id: 'company', canReadFieldValue: null, canUpdateFieldValue: null },
      { id: 'person', canReadFieldValue: false, canUpdateFieldValue: false },
    ]);
    expect(role.rowLevelPermissionRules?.map(({ id }) => id)).toEqual([
      'person-rule',
    ]);
    expect(role.rowLevelPermissionPredicateGroups?.map(({ id }) => id)).toEqual(
      ['person-group'],
    );
  });
});
