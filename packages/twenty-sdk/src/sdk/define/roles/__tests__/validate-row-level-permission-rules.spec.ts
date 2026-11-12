import { validateRowLevelPermissionRules } from '@/sdk/define/roles/validate-row-level-permission-rules';

const PREDICATE = {
  universalIdentifier: 'predicate',
  fieldUniversalIdentifier: 'owner',
  operand: 'IS',
};
const RULE = {
  universalIdentifier: 'rule',
  objectUniversalIdentifier: 'company',
  canReadRecords: true,
  predicates: [PREDICATE],
};

describe('validateRowLevelPermissionRules', () => {
  it('should accept a rule with nested predicates and predicate groups', () => {
    expect(
      validateRowLevelPermissionRules({
        label: 'Sales',
        rowLevelPermissionRules: [
          {
            ...RULE,
            predicateGroups: [
              {
                universalIdentifier: 'group',
                logicalOperator: 'OR',
                predicates: [
                  { ...PREDICATE, universalIdentifier: 'predicate-in-group' },
                ],
              },
            ],
          },
        ],
      }),
    ).toEqual({ errors: [], warnings: [] });
  });

  it('should warn when predicates are declared outside a rule', () => {
    const { errors, warnings } = validateRowLevelPermissionRules({
      label: 'Sales',
      rowLevelPermissionPredicates: [{ universalIdentifier: 'predicate' }],
    });

    expect(errors).toEqual([]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('Role "Sales"');
  });

  it('should reject a rule without any predicate or predicate group', () => {
    expect(
      validateRowLevelPermissionRules({
        label: 'Sales',
        rowLevelPermissionRules: [{ ...RULE, predicates: [] }],
      }).errors,
    ).toEqual([
      'Row level permission rule "rule" must have at least one predicate or predicate group',
    ]);
  });

  it('should reject a universalIdentifier used twice, across rules and nesting levels', () => {
    expect(
      validateRowLevelPermissionRules({
        label: 'Sales',
        rowLevelPermissionRules: [
          RULE,
          {
            ...RULE,
            predicates: [],
            predicateGroups: [
              {
                universalIdentifier: 'group',
                logicalOperator: 'AND',
                predicates: [PREDICATE],
              },
            ],
          },
        ],
      }).errors,
    ).toEqual([
      'Duplicate row level permission rule universalIdentifier "rule"',
      'Duplicate row level permission predicate universalIdentifier "predicate"',
    ]);
  });

  it('should reject a nested predicate or group missing a required property', () => {
    expect(
      validateRowLevelPermissionRules({
        label: 'Sales',
        rowLevelPermissionRules: [
          {
            ...RULE,
            predicates: [{ ...PREDICATE, operand: '' }],
            predicateGroups: [
              { universalIdentifier: 'group', logicalOperator: '' },
            ],
          },
        ],
      }).errors,
    ).toEqual([
      'Row level permission predicate must have an operand',
      'Row level permission predicate group must have a logicalOperator',
    ]);
  });
});
