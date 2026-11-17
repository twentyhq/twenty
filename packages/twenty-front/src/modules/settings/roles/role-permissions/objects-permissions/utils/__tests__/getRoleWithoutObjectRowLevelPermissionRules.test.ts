import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { getRoleWithoutObjectRowLevelPermissionRules } from '@/settings/roles/role-permissions/objects-permissions/utils/getRoleWithoutObjectRowLevelPermissionRules';
import {
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from '~/generated-metadata/graphql';

const buildPredicateGroup = ({
  id,
  parentRowLevelPermissionPredicateGroupId = null,
}: {
  id: string;
  parentRowLevelPermissionPredicateGroupId?: string | null;
}): RowLevelPermissionPredicateGroup => ({
  __typename: 'RowLevelPermissionPredicateGroup',
  id,
  parentRowLevelPermissionPredicateGroupId,
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
  positionInRowLevelPermissionPredicateGroup: null,
  canReadRecords: true,
  canUpdateRecords: false,
  canSoftDeleteRecords: false,
  canDestroyRecords: false,
  roleId: 'role-id',
  objectMetadataId: 'company',
});

const buildPredicate = ({
  id,
  objectMetadataId,
  relationFieldMetadataId = null,
  rowLevelPermissionPredicateGroupId = null,
}: {
  id: string;
  objectMetadataId: string;
  relationFieldMetadataId?: string | null;
  rowLevelPermissionPredicateGroupId?: string | null;
}): RowLevelPermissionPredicate => ({
  __typename: 'RowLevelPermissionPredicate',
  id,
  fieldMetadataId: 'field-id',
  relationFieldMetadataId,
  objectMetadataId,
  operand: RowLevelPermissionPredicateOperand.IS,
  subFieldName: null,
  workspaceMemberFieldMetadataId: null,
  workspaceMemberSubFieldName: null,
  rowLevelPermissionPredicateGroupId,
  positionInRowLevelPermissionPredicateGroup: null,
  roleId: 'role-id',
  value: 'value',
});

describe('getRoleWithoutObjectRowLevelPermissionRules', () => {
  it('should drop the object rules but keep its related record paths and other objects', () => {
    const role = getRoleWithoutObjectRowLevelPermissionRules({
      role: {
        ...DEFAULT_SETTINGS_DRAFT_ROLE,
        rowLevelPermissionPredicates: [
          buildPredicate({ id: 'rule', objectMetadataId: 'company' }),
          buildPredicate({
            id: 'related-path',
            objectMetadataId: 'company',
            relationFieldMetadataId: 'relation-field-id',
          }),
          buildPredicate({ id: 'other-object', objectMetadataId: 'person' }),
        ],
        rowLevelPermissionPredicateGroups: [
          buildPredicateGroup({ id: 'company-group' }),
        ],
      },
      objectMetadataId: 'company',
    });

    expect(role.rowLevelPermissionPredicates?.map(({ id }) => id)).toEqual([
      'related-path',
      'other-object',
    ]);
    expect(role.rowLevelPermissionPredicateGroups).toEqual([]);
  });

  it('should keep the groups of a related record path', () => {
    const role = getRoleWithoutObjectRowLevelPermissionRules({
      role: {
        ...DEFAULT_SETTINGS_DRAFT_ROLE,
        rowLevelPermissionPredicates: [
          buildPredicate({
            id: 'rule',
            objectMetadataId: 'company',
            rowLevelPermissionPredicateGroupId: 'rule-group',
          }),
          buildPredicate({
            id: 'related-path',
            objectMetadataId: 'company',
            relationFieldMetadataId: 'relation-field-id',
            rowLevelPermissionPredicateGroupId: 'related-path-child-group',
          }),
        ],
        rowLevelPermissionPredicateGroups: [
          buildPredicateGroup({ id: 'rule-group' }),
          buildPredicateGroup({ id: 'related-path-group' }),
          buildPredicateGroup({
            id: 'related-path-child-group',
            parentRowLevelPermissionPredicateGroupId: 'related-path-group',
          }),
        ],
      },
      objectMetadataId: 'company',
    });

    expect(role.rowLevelPermissionPredicates?.map(({ id }) => id)).toEqual([
      'related-path',
    ]);
    expect(role.rowLevelPermissionPredicateGroups?.map(({ id }) => id)).toEqual(
      ['related-path-group', 'related-path-child-group'],
    );
  });
});
