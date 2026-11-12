import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

type RuleLinkedEntity = {
  universalIdentifier: string;
  objectMetadataUniversalIdentifier: string;
  rowLevelPermissionRuleUniversalIdentifier: string | null;
};

type PredicateGroup = RuleLinkedEntity & {
  parentRowLevelPermissionPredicateGroupUniversalIdentifier: string | null;
};

type Predicate = RuleLinkedEntity & {
  rowLevelPermissionPredicateGroupUniversalIdentifier: string | null;
};

export const assertRowLevelPermissionRuleLinksOrThrow = ({
  declaredRules,
  predicateGroups,
  predicates,
}: {
  declaredRules: Pick<
    RuleLinkedEntity,
    'universalIdentifier' | 'objectMetadataUniversalIdentifier'
  >[];
  predicateGroups: PredicateGroup[];
  predicates: Predicate[];
}): void => {
  const predicateGroupByUniversalIdentifier = new Map(
    predicateGroups.map((predicateGroup) => [
      predicateGroup.universalIdentifier,
      predicateGroup,
    ]),
  );

  const findTopLevelPredicateGroup = (
    predicateGroupUniversalIdentifier: string,
  ): PredicateGroup | undefined => {
    const visitedUniversalIdentifiers = new Set<string>();
    let predicateGroup = predicateGroupByUniversalIdentifier.get(
      predicateGroupUniversalIdentifier,
    );

    while (
      isDefined(
        predicateGroup?.parentRowLevelPermissionPredicateGroupUniversalIdentifier,
      ) &&
      !visitedUniversalIdentifiers.has(predicateGroup.universalIdentifier)
    ) {
      visitedUniversalIdentifiers.add(predicateGroup.universalIdentifier);
      predicateGroup = predicateGroupByUniversalIdentifier.get(
        predicateGroup.parentRowLevelPermissionPredicateGroupUniversalIdentifier,
      );
    }

    return predicateGroup;
  };

  const ruleLinkedEntities = [
    ...predicateGroups.map((predicateGroup) => ({
      ...predicateGroup,
      containerPredicateGroupUniversalIdentifier:
        predicateGroup.parentRowLevelPermissionPredicateGroupUniversalIdentifier,
    })),
    ...predicates.map((predicate) => ({
      ...predicate,
      containerPredicateGroupUniversalIdentifier:
        predicate.rowLevelPermissionPredicateGroupUniversalIdentifier,
    })),
  ];

  const objectUniversalIdentifierByRuleUniversalIdentifier = new Map(
    declaredRules.map((rule) => [
      rule.universalIdentifier,
      rule.objectMetadataUniversalIdentifier,
    ]),
  );

  for (const ruleLinkedEntity of ruleLinkedEntities) {
    const ruleUniversalIdentifier =
      ruleLinkedEntity.rowLevelPermissionRuleUniversalIdentifier;

    if (!isDefined(ruleUniversalIdentifier)) {
      continue;
    }

    const ruleObjectUniversalIdentifier =
      objectUniversalIdentifierByRuleUniversalIdentifier.get(
        ruleUniversalIdentifier,
      );

    if (!isDefined(ruleObjectUniversalIdentifier)) {
      throw new ApplicationException(
        `Row level permission predicate or group ${ruleLinkedEntity.universalIdentifier} references rule ${ruleUniversalIdentifier}, which its role does not declare`,
        ApplicationExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: msg`A row level permission predicate references a rule its role does not declare.`,
        },
      );
    }

    const topLevelPredicateGroup = isDefined(
      ruleLinkedEntity.containerPredicateGroupUniversalIdentifier,
    )
      ? findTopLevelPredicateGroup(
          ruleLinkedEntity.containerPredicateGroupUniversalIdentifier,
        )
      : undefined;

    if (
      isDefined(topLevelPredicateGroup) &&
      topLevelPredicateGroup.rowLevelPermissionRuleUniversalIdentifier !==
        ruleUniversalIdentifier
    ) {
      throw new ApplicationException(
        `Row level permission predicate or group ${ruleLinkedEntity.universalIdentifier} is linked to rule ${ruleUniversalIdentifier}, which is not the rule of the group that contains it`,
        ApplicationExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: msg`A row level permission predicate must be on the same rule as the group that contains it.`,
        },
      );
    }

    if (
      ruleObjectUniversalIdentifier !==
      ruleLinkedEntity.objectMetadataUniversalIdentifier
    ) {
      throw new ApplicationException(
        `Row level permission predicate or group ${ruleLinkedEntity.universalIdentifier} and its rule ${ruleUniversalIdentifier} are not on the same object`,
        ApplicationExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: msg`A row level permission predicate and its rule must be on the same object.`,
        },
      );
    }
  }
};
