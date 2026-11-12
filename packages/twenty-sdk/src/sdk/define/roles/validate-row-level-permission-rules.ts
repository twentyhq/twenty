import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';

type RulePredicate = {
  universalIdentifier: string;
  fieldUniversalIdentifier: string;
  operand: string;
};

type RulePredicateGroup = {
  universalIdentifier: string;
  logicalOperator: string;
  predicates?: RulePredicate[];
  predicateGroups?: RulePredicateGroup[];
};

type Rule = {
  universalIdentifier: string;
  objectUniversalIdentifier: string;
  predicates?: RulePredicate[];
  predicateGroups?: RulePredicateGroup[];
};

export const validateRowLevelPermissionRules = ({
  label,
  rowLevelPermissionRules = [],
  rowLevelPermissionPredicateGroups = [],
  rowLevelPermissionPredicates = [],
}: {
  label: string;
  rowLevelPermissionRules?: Rule[];
  rowLevelPermissionPredicateGroups?: { universalIdentifier: string }[];
  rowLevelPermissionPredicates?: { universalIdentifier: string }[];
}): { errors: string[]; warnings: string[] } => {
  const errors: string[] = [];
  const ruleUniversalIdentifiers = new Set<string>();
  const predicateGroupUniversalIdentifiers = new Set(
    rowLevelPermissionPredicateGroups.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
  );
  const predicateUniversalIdentifiers = new Set(
    rowLevelPermissionPredicates.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
  );

  const addUniversalIdentifier = ({
    kind,
    universalIdentifier,
    universalIdentifiers,
  }: {
    kind: string;
    universalIdentifier: string;
    universalIdentifiers: Set<string>;
  }): void => {
    if (!isNonEmptyString(universalIdentifier)) {
      errors.push(
        `Row level permission ${kind} must have a universalIdentifier`,
      );

      return;
    }

    if (universalIdentifiers.has(universalIdentifier)) {
      errors.push(
        `Duplicate row level permission ${kind} universalIdentifier "${universalIdentifier}"`,
      );

      return;
    }

    universalIdentifiers.add(universalIdentifier);
  };

  const validateChildren = ({
    predicates = [],
    predicateGroups = [],
  }: Pick<RulePredicateGroup, 'predicates' | 'predicateGroups'>): void => {
    for (const predicate of predicates) {
      addUniversalIdentifier({
        kind: 'predicate',
        universalIdentifier: predicate.universalIdentifier,
        universalIdentifiers: predicateUniversalIdentifiers,
      });

      if (!isNonEmptyString(predicate.fieldUniversalIdentifier)) {
        errors.push(
          'Row level permission predicate must have a fieldUniversalIdentifier',
        );
      }

      if (!isNonEmptyString(predicate.operand)) {
        errors.push('Row level permission predicate must have an operand');
      }
    }

    for (const predicateGroup of predicateGroups) {
      addUniversalIdentifier({
        kind: 'predicate group',
        universalIdentifier: predicateGroup.universalIdentifier,
        universalIdentifiers: predicateGroupUniversalIdentifiers,
      });

      if (!isNonEmptyString(predicateGroup.logicalOperator)) {
        errors.push(
          'Row level permission predicate group must have a logicalOperator',
        );
      }

      validateChildren(predicateGroup);
    }
  };

  for (const rule of rowLevelPermissionRules) {
    addUniversalIdentifier({
      kind: 'rule',
      universalIdentifier: rule.universalIdentifier,
      universalIdentifiers: ruleUniversalIdentifiers,
    });

    if (!isNonEmptyString(rule.objectUniversalIdentifier)) {
      errors.push(
        'Row level permission rule must have an objectUniversalIdentifier',
      );
    }

    if (
      !isNonEmptyArray(rule.predicates) &&
      !isNonEmptyArray(rule.predicateGroups)
    ) {
      errors.push(
        `Row level permission rule "${rule.universalIdentifier}" must have at least one predicate or predicate group`,
      );
    }

    validateChildren(rule);
  }

  return {
    errors,
    warnings:
      isNonEmptyArray(rowLevelPermissionPredicateGroups) ||
      isNonEmptyArray(rowLevelPermissionPredicates)
        ? [
            `Role "${label}" declares rowLevelPermissionPredicates or rowLevelPermissionPredicateGroups, which are deprecated. Move them inside rowLevelPermissionRules, with the operations each rule grants, and remove those operations from the object permission. Until then the object permission is applied to the matching records only.`,
          ]
        : [],
  };
};
