import { isDefined } from 'twenty-shared/utils';

import { type RoleConfig } from '@/sdk/define/roles/role-config';

type RuleOwner = {
  objectUniversalIdentifier: string;
  rowLevelPermissionRuleUniversalIdentifier?: string | null;
};

export const validateRowLevelPermissionRules = ({
  label,
  rowLevelPermissionRules = [],
  rowLevelPermissionPredicateGroups = [],
  rowLevelPermissionPredicates = [],
}: Pick<
  RoleConfig,
  | 'label'
  | 'rowLevelPermissionRules'
  | 'rowLevelPermissionPredicateGroups'
  | 'rowLevelPermissionPredicates'
>): { errors: string[]; warnings: string[] } => {
  const errors: string[] = [];
  const objectUniversalIdentifierByRuleUniversalIdentifier = new Map<
    string,
    string
  >();

  for (const rule of rowLevelPermissionRules) {
    if (!rule.universalIdentifier) {
      errors.push('Row level permission rule must have a universalIdentifier');
    } else if (
      objectUniversalIdentifierByRuleUniversalIdentifier.has(
        rule.universalIdentifier,
      )
    ) {
      errors.push(
        `Duplicate row level permission rule universalIdentifier "${rule.universalIdentifier}"`,
      );
    } else {
      objectUniversalIdentifierByRuleUniversalIdentifier.set(
        rule.universalIdentifier,
        rule.objectUniversalIdentifier,
      );
    }

    if (!rule.objectUniversalIdentifier) {
      errors.push(
        'Row level permission rule must have an objectUniversalIdentifier',
      );
    }
  }

  const ruleOwners: (RuleOwner & { kind: string; isNested: boolean })[] = [
    ...rowLevelPermissionPredicateGroups.map((group) => ({
      ...group,
      kind: 'predicate group',
      isNested: isDefined(group.parentPredicateGroupUniversalIdentifier),
    })),
    ...rowLevelPermissionPredicates.map((predicate) => ({
      ...predicate,
      kind: 'predicate',
      isNested: isDefined(predicate.predicateGroupUniversalIdentifier),
    })),
  ];
  const referencedRuleUniversalIdentifiers = new Set<string>();
  let hasPredicatesWithoutRule = false;

  for (const ruleOwner of ruleOwners) {
    const ruleUniversalIdentifier =
      ruleOwner.rowLevelPermissionRuleUniversalIdentifier;

    if (!isDefined(ruleUniversalIdentifier)) {
      hasPredicatesWithoutRule ||= !ruleOwner.isNested;
      continue;
    }

    referencedRuleUniversalIdentifiers.add(ruleUniversalIdentifier);

    if (ruleOwner.isNested) {
      errors.push(
        `Row level permission ${ruleOwner.kind} inside a predicate group takes the rule of its root group and must not set rowLevelPermissionRuleUniversalIdentifier`,
      );
      continue;
    }

    const ruleObjectUniversalIdentifier =
      objectUniversalIdentifierByRuleUniversalIdentifier.get(
        ruleUniversalIdentifier,
      );

    if (!isDefined(ruleObjectUniversalIdentifier)) {
      errors.push(
        `Row level permission ${ruleOwner.kind} references unknown rule "${ruleUniversalIdentifier}"`,
      );
    } else if (
      ruleObjectUniversalIdentifier !== ruleOwner.objectUniversalIdentifier
    ) {
      errors.push(
        `Row level permission ${ruleOwner.kind} and its rule "${ruleUniversalIdentifier}" must be on the same object`,
      );
    }
  }

  for (const ruleUniversalIdentifier of objectUniversalIdentifierByRuleUniversalIdentifier.keys()) {
    if (!referencedRuleUniversalIdentifiers.has(ruleUniversalIdentifier)) {
      errors.push(
        `Row level permission rule "${ruleUniversalIdentifier}" must have at least one predicate or predicate group`,
      );
    }
  }

  return {
    errors,
    warnings: hasPredicatesWithoutRule
      ? [
          `Role "${label}" declares row level permission predicates outside a rule, which is deprecated. Declare rowLevelPermissionRules with the operations each rule grants, set rowLevelPermissionRuleUniversalIdentifier on its root predicate groups and ungrouped predicates, and remove those operations from the object permission. Until then the object permission is applied to the matching records only.`,
        ]
      : [],
  };
};
