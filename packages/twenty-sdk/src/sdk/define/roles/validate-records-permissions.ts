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

type RowLevelRecordsPermissions = {
  universalIdentifier: string;
  predicates?: RulePredicate[];
  predicateGroups?: RulePredicateGroup[];
  unreadableFields?: string[];
  uneditableFields?: string[];
};

type ObjectRecordsPermissions = {
  objectUniversalIdentifier: string;
  rowLevelRecordsPermissions?: RowLevelRecordsPermissions[];
};

export const validateRecordsPermissions = ({
  recordsPermissions,
  objectPermissions = [],
  rowLevelPermissionPredicateGroups = [],
  rowLevelPermissionPredicates = [],
}: {
  recordsPermissions?: { objects?: ObjectRecordsPermissions[] };
  objectPermissions?: { objectUniversalIdentifier: string }[];
  rowLevelPermissionPredicateGroups?: { universalIdentifier: string }[];
  rowLevelPermissionPredicates?: { universalIdentifier: string }[];
}): string[] => {
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

  const objectUniversalIdentifiers = new Set(
    objectPermissions.map(
      ({ objectUniversalIdentifier }) => objectUniversalIdentifier,
    ),
  );

  for (const {
    objectUniversalIdentifier,
    rowLevelRecordsPermissions = [],
  } of recordsPermissions?.objects ?? []) {
    if (!isNonEmptyString(objectUniversalIdentifier)) {
      errors.push(
        'An object of recordsPermissions must have an objectUniversalIdentifier',
      );
    } else if (objectUniversalIdentifiers.has(objectUniversalIdentifier)) {
      errors.push(
        `Object "${objectUniversalIdentifier}" is declared more than once across recordsPermissions and objectPermissions`,
      );
    } else {
      objectUniversalIdentifiers.add(objectUniversalIdentifier);
    }

    for (const rule of rowLevelRecordsPermissions) {
      addUniversalIdentifier({
        kind: 'rule',
        universalIdentifier: rule.universalIdentifier,
        universalIdentifiers: ruleUniversalIdentifiers,
      });

      if (
        !isNonEmptyArray(rule.predicates) &&
        !isNonEmptyArray(rule.predicateGroups)
      ) {
        errors.push(
          `Row level permission rule "${rule.universalIdentifier}" must have at least one predicate or predicate group`,
        );
      }

      if (
        (isNonEmptyArray(rule.unreadableFields) ||
          isNonEmptyArray(rule.uneditableFields)) &&
        !isNonEmptyArray(rule.predicateGroups)
      ) {
        errors.push(
          `Row level permission rule "${rule.universalIdentifier}" declares unreadableFields or uneditableFields and needs at least one predicate group to hold them`,
        );
      }

      validateChildren(rule);
    }
  }

  return errors;
};
