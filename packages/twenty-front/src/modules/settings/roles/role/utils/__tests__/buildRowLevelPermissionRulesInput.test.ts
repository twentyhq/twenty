import { buildRowLevelPermissionRulesInput } from '@/settings/roles/role/utils/buildRowLevelPermissionRulesInput';
import {
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from '~/generated-metadata/graphql';

const RULE_OPERATIONS = {
  canReadRecords: true,
  canCreateRecords: false,
  canUpdateRecords: false,
  canSoftDeleteRecords: false,
  canDestroyRecords: false,
};

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
  it('nests each group under the rule of its group without a parent', () => {
    const rules = buildRowLevelPermissionRulesInput({
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
        }),
        buildPredicateGroup({
          id: 'team-group',
          parentRowLevelPermissionPredicateGroupId: null,
        }),
      ],
      predicates: [
        buildPredicate({
          id: 'owner-predicate',
          rowLevelPermissionPredicateGroupId: 'owner-group',
        }),
        buildPredicate({
          id: 'nested-predicate',
          rowLevelPermissionPredicateGroupId: 'nested-group',
        }),
        buildPredicate({
          id: 'team-predicate',
          rowLevelPermissionPredicateGroupId: 'team-group',
        }),
      ],
      ruleOperations: RULE_OPERATIONS,
    });

    expect(rules).toHaveLength(2);
    expect(rules[0]).toMatchObject({
      id: 'owner-rule',
      ...RULE_OPERATIONS,
      predicateGroups: [
        {
          id: 'owner-group',
          predicates: [{ id: 'owner-predicate' }],
          predicateGroups: [
            {
              id: 'nested-group',
              logicalOperator:
                RowLevelPermissionPredicateGroupLogicalOperator.OR,
              predicates: [{ id: 'nested-predicate' }],
              predicateGroups: [],
            },
          ],
        },
      ],
    });
    expect(rules[1]).toMatchObject({
      id: undefined,
      predicateGroups: [
        { id: 'team-group', predicates: [{ id: 'team-predicate' }] },
      ],
    });
  });

  it('keeps a rule with several groups as one rule', () => {
    const rules = buildRowLevelPermissionRulesInput({
      predicateGroups: [
        buildPredicateGroup({
          id: 'first-group',
          parentRowLevelPermissionPredicateGroupId: null,
          rowLevelPermissionRuleId: 'shared-rule',
        }),
        buildPredicateGroup({
          id: 'second-group',
          parentRowLevelPermissionPredicateGroupId: null,
          rowLevelPermissionRuleId: 'shared-rule',
        }),
      ],
      predicates: [],
      ruleOperations: RULE_OPERATIONS,
    });

    expect(rules).toHaveLength(1);
    expect(rules[0]).toMatchObject({
      id: 'shared-rule',
      predicateGroups: [{ id: 'first-group' }, { id: 'second-group' }],
    });
  });

  it('keeps predicates in no group in their own rules', () => {
    const rules = buildRowLevelPermissionRulesInput({
      predicateGroups: [],
      predicates: [
        buildPredicate({
          id: 'owner-predicate',
          rowLevelPermissionPredicateGroupId: null,
          rowLevelPermissionRuleId: 'owner-rule',
          positionInRowLevelPermissionPredicateGroup: 2,
        }),
        buildPredicate({
          id: 'team-predicate',
          rowLevelPermissionPredicateGroupId: null,
          rowLevelPermissionRuleId: 'team-rule',
        }),
      ],
      ruleOperations: RULE_OPERATIONS,
    });

    expect(rules).toEqual([
      expect.objectContaining({
        id: 'owner-rule',
        predicates: [
          expect.objectContaining({ id: 'owner-predicate', position: 2 }),
        ],
      }),
      expect.objectContaining({
        id: 'team-rule',
        predicates: [expect.objectContaining({ id: 'team-predicate' })],
      }),
    ]);
  });
});
