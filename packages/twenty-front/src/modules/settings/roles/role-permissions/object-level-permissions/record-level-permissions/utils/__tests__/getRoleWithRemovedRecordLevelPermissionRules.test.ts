import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { getRoleWithRemovedRecordLevelPermissionRules } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/utils/getRoleWithRemovedRecordLevelPermissionRules';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import {
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from '~/generated-metadata/graphql';

const ROLE_ID = 'role-id';
const COMPANY_OBJECT_METADATA_ID = 'company-object-metadata-id';
const PERSON_OBJECT_METADATA_ID = 'person-object-metadata-id';

const buildPredicateGroup = (
  objectMetadataId: string,
): RowLevelPermissionPredicateGroup => ({
  __typename: 'RowLevelPermissionPredicateGroup',
  id: `${objectMetadataId}-group`,
  objectMetadataId,
  roleId: ROLE_ID,
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
  parentRowLevelPermissionPredicateGroupId: null,
  positionInRowLevelPermissionPredicateGroup: 0,
});

const buildPredicate = (
  objectMetadataId: string,
): RowLevelPermissionPredicate => ({
  __typename: 'RowLevelPermissionPredicate',
  id: `${objectMetadataId}-predicate`,
  objectMetadataId,
  roleId: ROLE_ID,
  fieldMetadataId: `${objectMetadataId}-name-field`,
  operand: RowLevelPermissionPredicateOperand.IS,
  value: 'Acme',
  subFieldName: null,
  workspaceMemberFieldMetadataId: null,
  workspaceMemberSubFieldName: null,
  rowLevelPermissionPredicateGroupId: `${objectMetadataId}-group`,
  positionInRowLevelPermissionPredicateGroup: 0,
});

const ROLE_WITH_RULES: RoleWithPartialMembers = {
  ...DEFAULT_SETTINGS_DRAFT_ROLE,
  id: ROLE_ID,
  rowLevelPermissionPredicates: [
    buildPredicate(COMPANY_OBJECT_METADATA_ID),
    buildPredicate(PERSON_OBJECT_METADATA_ID),
  ],
  rowLevelPermissionPredicateGroups: [
    buildPredicateGroup(COMPANY_OBJECT_METADATA_ID),
    buildPredicateGroup(PERSON_OBJECT_METADATA_ID),
  ],
};

describe('getRoleWithRemovedRecordLevelPermissionRules', () => {
  it('should remove the predicates and predicate groups of the given object only', () => {
    const updatedRole = getRoleWithRemovedRecordLevelPermissionRules(
      ROLE_WITH_RULES,
      COMPANY_OBJECT_METADATA_ID,
    );

    expect(updatedRole).toEqual({
      ...ROLE_WITH_RULES,
      rowLevelPermissionPredicates: [buildPredicate(PERSON_OBJECT_METADATA_ID)],
      rowLevelPermissionPredicateGroups: [
        buildPredicateGroup(PERSON_OBJECT_METADATA_ID),
      ],
    });
  });

  it('should remove predicate groups of the given object even without predicates', () => {
    const updatedRole = getRoleWithRemovedRecordLevelPermissionRules(
      {
        ...ROLE_WITH_RULES,
        rowLevelPermissionPredicates: [],
      },
      COMPANY_OBJECT_METADATA_ID,
    );

    expect(updatedRole.rowLevelPermissionPredicateGroups).toEqual([
      buildPredicateGroup(PERSON_OBJECT_METADATA_ID),
    ]);
  });

  it('should keep missing predicates and predicate groups missing', () => {
    const updatedRole = getRoleWithRemovedRecordLevelPermissionRules(
      {
        ...ROLE_WITH_RULES,
        rowLevelPermissionPredicates: undefined,
        rowLevelPermissionPredicateGroups: undefined,
      },
      COMPANY_OBJECT_METADATA_ID,
    );

    expect(updatedRole.rowLevelPermissionPredicates).toBeUndefined();
    expect(updatedRole.rowLevelPermissionPredicateGroups).toBeUndefined();
  });
});
