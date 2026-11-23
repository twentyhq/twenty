import { buildRowLevelPermissionRulesInput } from '@/settings/roles/role/utils/buildRowLevelPermissionRulesInput';
import {
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
  type RowLevelPermissionRule,
} from '~/generated-metadata/graphql';

const buildRule = (
  rule: Pick<RowLevelPermissionRule, 'id'> & Partial<RowLevelPermissionRule>,
): RowLevelPermissionRule => ({
  objectMetadataId: 'object-id',
  canReadRecords: true,
  canCreateRecords: false,
  canUpdateRecords: false,
  canSoftDeleteRecords: false,
  canDestroyRecords: false,
  ...rule,
});

const buildPredicateGroup = (
  predicateGroup: Pick<
    RowLevelPermissionPredicateGroup,
    'id' | 'parentRowLevelPermissionPredicateGroupId'
  > &
    Partial<RowLevelPermissionPredicateGroup>,
): RowLevelPermissionPredicateGroup => ({
  roleId: 'role-id',
  objectMetadataId: 'object-id',
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
  positionInRowLevelPermissionPredicateGroup: 0,
  canReadRecords: false,
  canUpdateRecords: false,
  canSoftDeleteRecords: false,
  canDestroyRecords: false,
  ...predicateGroup,
});

const buildPredicate = (
  predicate: Pick<
    RowLevelPermissionPredicate,
    'id' | 'rowLevelPermissionPredicateGroupId'
  > &
    Partial<RowLevelPermissionPredicate>,
): RowLevelPermissionPredicate => ({
  roleId: 'role-id',
  objectMetadataId: 'object-id',
  fieldMetadataId: 'owner-field-id',
  operand: RowLevelPermissionPredicateOperand.IS,
  value: null,
  positionInRowLevelPermissionPredicateGroup: 0,
  ...predicate,
});

describe('buildRowLevelPermissionRulesInput', () => {
  it('sends each rule with its own grants and its nested conditions', () => {
    const rules = buildRowLevelPermissionRulesInput({
      rules: [
        buildRule({ id: 'owner-rule' }),
        buildRule({
          id: 'team-rule',
          canUpdateRecords: true,
          canCreateRecords: true,
        }),
      ],
      predicateGroups: [
        buildPredicateGroup({
          id: 'owner-group',
          parentRowLevelPermissionPredicateGroupId: null,
          rowLevelPermissionRuleId: 'owner-rule',
        }),
        buildPredicateGroup({
          id: 'nested-group',
          parentRowLevelPermissionPredicateGroupId: 'owner-group',
          logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
          rowLevelPermissionRuleId: 'owner-rule',
        }),
      ],
      predicates: [
        buildPredicate({
          id: 'owner-predicate',
          rowLevelPermissionPredicateGroupId: 'owner-group',
          rowLevelPermissionRuleId: 'owner-rule',
        }),
        buildPredicate({
          id: 'nested-predicate',
          rowLevelPermissionPredicateGroupId: 'nested-group',
          rowLevelPermissionRuleId: 'owner-rule',
        }),
        buildPredicate({
          id: 'team-predicate',
          rowLevelPermissionPredicateGroupId: null,
          rowLevelPermissionRuleId: 'team-rule',
          positionInRowLevelPermissionPredicateGroup: 2,
        }),
      ],
    });

    expect(rules).toEqual([
      expect.objectContaining({
        id: 'owner-rule',
        canReadRecords: true,
        canUpdateRecords: false,
        predicates: [],
        predicateGroups: [
          expect.objectContaining({
            id: 'owner-group',
            predicates: [expect.objectContaining({ id: 'owner-predicate' })],
            predicateGroups: [
              expect.objectContaining({
                id: 'nested-group',
                logicalOperator:
                  RowLevelPermissionPredicateGroupLogicalOperator.OR,
                predicates: [
                  expect.objectContaining({ id: 'nested-predicate' }),
                ],
              }),
            ],
          }),
        ],
      }),
      expect.objectContaining({
        id: 'team-rule',
        canUpdateRecords: true,
        canCreateRecords: true,
        predicates: [
          expect.objectContaining({ id: 'team-predicate', position: 2 }),
        ],
        predicateGroups: [],
      }),
    ]);
  });

  it('leaves out a rule without any condition', () => {
    const rules = buildRowLevelPermissionRulesInput({
      rules: [buildRule({ id: 'empty-rule' })],
      predicateGroups: [
        buildPredicateGroup({
          id: 'empty-group',
          parentRowLevelPermissionPredicateGroupId: null,
          rowLevelPermissionRuleId: 'empty-rule',
        }),
      ],
      predicates: [],
    });

    expect(rules).toEqual([]);
  });
});
