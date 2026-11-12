import { assertRowLevelPermissionRuleLinksOrThrow } from 'src/engine/core-modules/application/application-manifest/utils/assert-row-level-permission-rule-links-or-throw.util';

const RULE = {
  universalIdentifier: 'rule',
  objectMetadataUniversalIdentifier: 'company',
};
const PREDICATE = {
  universalIdentifier: 'predicate',
  objectMetadataUniversalIdentifier: 'company',
  rowLevelPermissionRuleUniversalIdentifier: 'rule',
};

describe('assertRowLevelPermissionRuleLinksOrThrow', () => {
  it('should accept entities linked to a declared rule on their object, or to no rule', () => {
    expect(() =>
      assertRowLevelPermissionRuleLinksOrThrow({
        declaredRules: [RULE],
        ruleLinkedEntities: [
          PREDICATE,
          { ...PREDICATE, rowLevelPermissionRuleUniversalIdentifier: null },
        ],
      }),
    ).not.toThrow();
  });

  it('should throw when the rule is not declared on the role', () => {
    expect(() =>
      assertRowLevelPermissionRuleLinksOrThrow({
        declaredRules: [],
        ruleLinkedEntities: [PREDICATE],
      }),
    ).toThrow('which its role does not declare');
  });

  it('should throw when the rule is on another object', () => {
    expect(() =>
      assertRowLevelPermissionRuleLinksOrThrow({
        declaredRules: [
          { ...RULE, objectMetadataUniversalIdentifier: 'person' },
        ],
        ruleLinkedEntities: [PREDICATE],
      }),
    ).toThrow('are not on the same object');
  });
});
