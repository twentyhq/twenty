import { validateObjectRecordsPermissions } from '@/sdk/define/roles/validate-object-records-permissions';

const PREDICATE = {
  universalIdentifier: 'predicate',
  fieldUniversalIdentifier: 'owner',
  operand: 'IS',
};
const RULE = {
  universalIdentifier: 'rule',
  canReadRecords: true,
  predicates: [PREDICATE],
};
const COMPANY = {
  objectUniversalIdentifier: 'company',
  canUpdateAllRecords: true,
};

describe('validateObjectRecordsPermissions', () => {
  it('should accept all records grants on their own, and rules with nested predicates and predicate groups', () => {
    expect(
      validateObjectRecordsPermissions({
        label: 'Sales',
        objectRecordsPermissions: [
          { objectUniversalIdentifier: 'person' },
          {
            ...COMPANY,
            rowLevelRecordsPermissions: [
              {
                ...RULE,
                predicateGroups: [
                  {
                    universalIdentifier: 'group',
                    logicalOperator: 'OR',
                    predicates: [
                      {
                        ...PREDICATE,
                        universalIdentifier: 'predicate-in-group',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      }),
    ).toEqual({ errors: [], warnings: [] });
  });

  it('should warn when predicates are declared directly on the role', () => {
    const { errors, warnings } = validateObjectRecordsPermissions({
      label: 'Sales',
      rowLevelPermissionPredicates: [{ universalIdentifier: 'predicate' }],
    });

    expect(errors).toEqual([]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('Role "Sales"');
  });

  it('should reject an object declared twice, across both forms', () => {
    expect(
      validateObjectRecordsPermissions({
        label: 'Sales',
        objectPermissions: [{ objectUniversalIdentifier: 'company' }],
        objectRecordsPermissions: [COMPANY],
      }).errors,
    ).toEqual([
      'Object "company" is declared more than once across objectRecordsPermissions and objectPermissions',
    ]);
  });

  it('should reject a rule without any predicate or predicate group', () => {
    expect(
      validateObjectRecordsPermissions({
        label: 'Sales',
        objectRecordsPermissions: [
          {
            ...COMPANY,
            rowLevelRecordsPermissions: [{ ...RULE, predicates: [] }],
          },
        ],
      }).errors,
    ).toEqual([
      'Row level permission rule "rule" must have at least one predicate or predicate group',
    ]);
  });

  it('should reject a universalIdentifier used twice, across objects and nesting levels', () => {
    expect(
      validateObjectRecordsPermissions({
        label: 'Sales',
        objectRecordsPermissions: [
          { ...COMPANY, rowLevelRecordsPermissions: [RULE] },
          {
            objectUniversalIdentifier: 'person',
            rowLevelRecordsPermissions: [
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
      validateObjectRecordsPermissions({
        label: 'Sales',
        objectRecordsPermissions: [
          {
            ...COMPANY,
            rowLevelRecordsPermissions: [
              {
                ...RULE,
                predicates: [{ ...PREDICATE, operand: '' }],
                predicateGroups: [
                  { universalIdentifier: 'group', logicalOperator: '' },
                ],
              },
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
