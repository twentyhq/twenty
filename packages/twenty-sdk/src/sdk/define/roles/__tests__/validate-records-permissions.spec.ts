import { validateRecordsPermissions } from '@/sdk/define/roles/validate-records-permissions';

const PREDICATE = {
  universalIdentifier: 'predicate',
  fieldUniversalIdentifier: 'owner',
  operand: 'IS',
};
const RULE = {
  universalIdentifier: 'rule',
  predicates: [PREDICATE],
};
const GROUP = {
  universalIdentifier: 'group',
  logicalOperator: 'OR',
  predicates: [{ ...PREDICATE, universalIdentifier: 'predicate-in-group' }],
};

describe('validateRecordsPermissions', () => {
  it('should accept objects with or without rules, and rules with nested predicates and predicate groups', () => {
    expect(
      validateRecordsPermissions({
        recordsPermissions: {
          objects: [
            { objectUniversalIdentifier: 'person' },
            {
              objectUniversalIdentifier: 'company',
              rowLevelRecordsPermissions: [
                {
                  ...RULE,
                  predicateGroups: [GROUP],
                  unreadableFields: ['secret'],
                },
              ],
            },
          ],
        },
      }),
    ).toEqual([]);
  });

  it('should reject an object declared twice, across recordsPermissions and objectPermissions', () => {
    expect(
      validateRecordsPermissions({
        objectPermissions: [{ objectUniversalIdentifier: 'company' }],
        recordsPermissions: {
          objects: [{ objectUniversalIdentifier: 'company' }],
        },
      }),
    ).toEqual([
      'Object "company" is declared more than once across recordsPermissions and objectPermissions',
    ]);
  });

  it('should reject a rule without any predicate or predicate group', () => {
    expect(
      validateRecordsPermissions({
        recordsPermissions: {
          objects: [
            {
              objectUniversalIdentifier: 'company',
              rowLevelRecordsPermissions: [{ ...RULE, predicates: [] }],
            },
          ],
        },
      }),
    ).toEqual([
      'Row level permission rule "rule" must have at least one predicate or predicate group',
    ]);
  });

  it('should reject field restrictions on a rule that has no predicate group', () => {
    expect(
      validateRecordsPermissions({
        recordsPermissions: {
          objects: [
            {
              objectUniversalIdentifier: 'company',
              rowLevelRecordsPermissions: [
                { ...RULE, uneditableFields: ['secret'] },
              ],
            },
          ],
        },
      }),
    ).toEqual([
      'Row level permission rule "rule" declares unreadableFields or uneditableFields and needs at least one predicate group to hold them',
    ]);
  });

  it('should reject a universalIdentifier used twice, across objects, nesting levels and the deprecated predicates', () => {
    expect(
      validateRecordsPermissions({
        rowLevelPermissionPredicates: [
          { universalIdentifier: 'predicate-in-group' },
        ],
        recordsPermissions: {
          objects: [
            {
              objectUniversalIdentifier: 'company',
              rowLevelRecordsPermissions: [RULE],
            },
            {
              objectUniversalIdentifier: 'person',
              rowLevelRecordsPermissions: [
                { ...RULE, predicates: [], predicateGroups: [GROUP] },
              ],
            },
          ],
        },
      }),
    ).toEqual([
      'Duplicate row level permission rule universalIdentifier "rule"',
      'Duplicate row level permission predicate universalIdentifier "predicate-in-group"',
    ]);
  });

  it('should reject a nested predicate or group missing a required property', () => {
    expect(
      validateRecordsPermissions({
        recordsPermissions: {
          objects: [
            {
              objectUniversalIdentifier: 'company',
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
        },
      }),
    ).toEqual([
      'Row level permission predicate must have an operand',
      'Row level permission predicate group must have a logicalOperator',
    ]);
  });
});
