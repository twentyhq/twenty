import { getRowLevelPermissionRulesSaveError } from '@/settings/roles/role/utils/getRowLevelPermissionRulesSaveError';
import {
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from '~/generated-metadata/graphql';

const rootGroup: RowLevelPermissionPredicateGroup = {
  __typename: 'RowLevelPermissionPredicateGroup',
  id: 'rule',
  parentRowLevelPermissionPredicateGroupId: null,
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
  positionInRowLevelPermissionPredicateGroup: null,
  canReadRecords: true,
  canUpdateRecords: false,
  canSoftDeleteRecords: false,
  canDestroyRecords: false,
  roleId: 'role-id',
  objectMetadataId: 'company',
  rowLevelPermissionRuleId: null,
};

const buildPredicate = ({
  value,
}: {
  value: string | null;
}): RowLevelPermissionPredicate => ({
  __typename: 'RowLevelPermissionPredicate',
  id: 'predicate',
  fieldMetadataId: 'name-field',
  relationFieldMetadataId: null,
  objectMetadataId: 'company',
  operand: RowLevelPermissionPredicateOperand.CONTAINS,
  subFieldName: null,
  workspaceMemberFieldMetadataId: null,
  workspaceMemberSubFieldName: null,
  rowLevelPermissionPredicateGroupId: 'rule',
  positionInRowLevelPermissionPredicateGroup: 0,
  roleId: 'role-id',
  value,
  rowLevelPermissionRuleId: null,
});

describe('getRowLevelPermissionRulesSaveError', () => {
  it('should refuse a rule without filter', () => {
    expect(
      getRowLevelPermissionRulesSaveError({
        rowLevelPermissionPredicateGroups: [rootGroup],
        rowLevelPermissionPredicates: [],
      }),
    ).toBe('Each rule needs at least one condition');
  });

  it('should refuse a filter without value', () => {
    expect(
      getRowLevelPermissionRulesSaveError({
        rowLevelPermissionPredicateGroups: [rootGroup],
        rowLevelPermissionPredicates: [buildPredicate({ value: null })],
      }),
    ).toBe('A rule condition is missing its value');
  });

  it('should accept a complete rule', () => {
    expect(
      getRowLevelPermissionRulesSaveError({
        rowLevelPermissionPredicateGroups: [rootGroup],
        rowLevelPermissionPredicates: [buildPredicate({ value: 'Apple' })],
      }),
    ).toBeUndefined();
  });
});
