import { validateRowLevelPermissionRules } from '@/sdk/define/roles/validate-row-level-permission-rules';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

const RULE = {
  universalIdentifier: 'rule',
  objectUniversalIdentifier: 'company',
  canReadRecords: true,
};
const PREDICATE = {
  universalIdentifier: 'predicate',
  objectUniversalIdentifier: 'company',
  fieldUniversalIdentifier: 'owner',
  operand: RowLevelPermissionPredicateOperand.IS,
};
const ROOT_GROUP = {
  universalIdentifier: 'root',
  objectUniversalIdentifier: 'company',
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
};

describe('validateRowLevelPermissionRules', () => {
  it('should accept predicates and root groups linked to a declared rule', () => {
    expect(
      validateRowLevelPermissionRules({
        label: 'Sales',
        rowLevelPermissionRules: [RULE],
        rowLevelPermissionPredicateGroups: [
          { ...ROOT_GROUP, rowLevelPermissionRuleUniversalIdentifier: 'rule' },
        ],
        rowLevelPermissionPredicates: [
          { ...PREDICATE, predicateGroupUniversalIdentifier: 'root' },
        ],
      }),
    ).toEqual({ errors: [], warnings: [] });
  });

  it('should warn when predicates sit outside a rule', () => {
    const { errors, warnings } = validateRowLevelPermissionRules({
      label: 'Sales',
      rowLevelPermissionPredicates: [PREDICATE],
    });

    expect(errors).toEqual([]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('Role "Sales"');
  });

  it('should reject a reference to a rule the role does not declare', () => {
    expect(
      validateRowLevelPermissionRules({
        label: 'Sales',
        rowLevelPermissionPredicates: [
          { ...PREDICATE, rowLevelPermissionRuleUniversalIdentifier: 'rule' },
        ],
      }).errors,
    ).toEqual([
      'Row level permission predicate references unknown rule "rule"',
    ]);
  });

  it('should reject a rule on another object than its predicate', () => {
    expect(
      validateRowLevelPermissionRules({
        label: 'Sales',
        rowLevelPermissionRules: [
          { ...RULE, objectUniversalIdentifier: 'person' },
        ],
        rowLevelPermissionPredicates: [
          { ...PREDICATE, rowLevelPermissionRuleUniversalIdentifier: 'rule' },
        ],
      }).errors,
    ).toEqual([
      'Row level permission predicate and its rule "rule" must be on the same object',
    ]);
  });

  it('should reject a duplicate rule and a rule without predicates', () => {
    expect(
      validateRowLevelPermissionRules({
        label: 'Sales',
        rowLevelPermissionRules: [RULE, RULE],
      }).errors,
    ).toEqual([
      'Duplicate row level permission rule universalIdentifier "rule"',
      'Row level permission rule "rule" must have at least one predicate or predicate group',
    ]);
  });
});
