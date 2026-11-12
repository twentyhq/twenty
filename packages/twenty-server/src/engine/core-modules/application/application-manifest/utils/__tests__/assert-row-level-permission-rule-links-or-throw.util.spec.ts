import { assertRowLevelPermissionRuleLinksOrThrow } from 'src/engine/core-modules/application/application-manifest/utils/assert-row-level-permission-rule-links-or-throw.util';

const RULE = {
  universalIdentifier: 'rule',
  objectMetadataUniversalIdentifier: 'company',
};
const OTHER_RULE = { ...RULE, universalIdentifier: 'other-rule' };
const PREDICATE = {
  universalIdentifier: 'predicate',
  objectMetadataUniversalIdentifier: 'company',
  rowLevelPermissionRuleUniversalIdentifier: 'rule',
  rowLevelPermissionPredicateGroupUniversalIdentifier: null,
};
const GROUP = {
  universalIdentifier: 'group',
  objectMetadataUniversalIdentifier: 'company',
  rowLevelPermissionRuleUniversalIdentifier: 'rule',
  parentRowLevelPermissionPredicateGroupUniversalIdentifier: null,
};

describe('assertRowLevelPermissionRuleLinksOrThrow', () => {
  it('should accept entities linked to a declared rule on their object, or to no rule', () => {
    expect(() =>
      assertRowLevelPermissionRuleLinksOrThrow({
        declaredRules: [RULE],
        predicateGroups: [GROUP],
        predicates: [
          PREDICATE,
          {
            ...PREDICATE,
            universalIdentifier: 'grouped-predicate',
            rowLevelPermissionPredicateGroupUniversalIdentifier: 'group',
          },
          {
            ...PREDICATE,
            universalIdentifier: 'predicate-without-rule',
            rowLevelPermissionRuleUniversalIdentifier: null,
          },
        ],
      }),
    ).not.toThrow();
  });

  it('should throw when the rule is not declared on the role', () => {
    expect(() =>
      assertRowLevelPermissionRuleLinksOrThrow({
        declaredRules: [],
        predicateGroups: [],
        predicates: [PREDICATE],
      }),
    ).toThrow('which its role does not declare');
  });

  it('should throw when the rule is on another object', () => {
    expect(() =>
      assertRowLevelPermissionRuleLinksOrThrow({
        declaredRules: [
          { ...RULE, objectMetadataUniversalIdentifier: 'person' },
        ],
        predicateGroups: [],
        predicates: [PREDICATE],
      }),
    ).toThrow('are not on the same object');
  });

  it('should throw when a predicate is not on the rule of the group that contains it', () => {
    expect(() =>
      assertRowLevelPermissionRuleLinksOrThrow({
        declaredRules: [RULE, OTHER_RULE],
        predicateGroups: [
          GROUP,
          {
            ...GROUP,
            universalIdentifier: 'nested-group',
            rowLevelPermissionRuleUniversalIdentifier: null,
            parentRowLevelPermissionPredicateGroupUniversalIdentifier: 'group',
          },
        ],
        predicates: [
          {
            ...PREDICATE,
            rowLevelPermissionRuleUniversalIdentifier: 'other-rule',
            rowLevelPermissionPredicateGroupUniversalIdentifier: 'nested-group',
          },
        ],
      }),
    ).toThrow('is not the rule of the group that contains it');
  });
});
