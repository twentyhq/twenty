import { getObjectPermissionUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { buildRowLevelPermissionRules } from 'src/engine/metadata-modules/row-level-permission-predicate/utils/build-row-level-permission-rules.util';
import { type UniversalFlatObjectPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-permission.type';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { type UniversalFlatRowLevelPermissionPredicateGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate-group.type';
import { type UniversalFlatRowLevelPermissionPredicate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate.type';
import { type UniversalFlatRowLevelPermissionRule } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-rule.type';

const NO_OBJECT_RECORDS_GRANTS = {
  canReadObjectRecords: false,
  canCreateObjectRecords: false,
  canUpdateObjectRecords: false,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
};

// TODO(charles): drop the fallback once published applications declare their rules
export const resolveRoleManifestRowLevelPermissionRules = ({
  universalFlatRole,
  universalFlatObjectPermissions,
  declaredRules,
  predicateGroups,
  predicates,
  now,
}: {
  universalFlatRole: Pick<
    UniversalFlatRole,
    | 'universalIdentifier'
    | 'applicationUniversalIdentifier'
    | 'canReadAllObjectRecords'
    | 'canCreateAllObjectRecords'
    | 'canUpdateAllObjectRecords'
    | 'canSoftDeleteAllObjectRecords'
    | 'canDestroyAllObjectRecords'
  >;
  universalFlatObjectPermissions: UniversalFlatObjectPermission[];
  declaredRules: UniversalFlatRowLevelPermissionRule[];
  predicateGroups: UniversalFlatRowLevelPermissionPredicateGroup[];
  predicates: UniversalFlatRowLevelPermissionPredicate[];
  now: string;
}): {
  rules: UniversalFlatRowLevelPermissionRule[];
  predicateGroups: UniversalFlatRowLevelPermissionPredicateGroup[];
  predicates: UniversalFlatRowLevelPermissionPredicate[];
  objectPermissions: UniversalFlatObjectPermission[];
} => {
  const {
    rules: derivedRules,
    ruleUniversalIdentifierByPredicateGroupUniversalIdentifier,
    ruleUniversalIdentifierByPredicateUniversalIdentifier,
  } = buildRowLevelPermissionRules({ predicateGroups, predicates, now });

  const declaredRuleUniversalIdentifierByDerivedRuleUniversalIdentifier =
    new Map<string, string>();

  for (const predicateGroup of predicateGroups) {
    const derivedRuleUniversalIdentifier =
      ruleUniversalIdentifierByPredicateGroupUniversalIdentifier.get(
        predicateGroup.universalIdentifier,
      );

    if (
      isDefined(derivedRuleUniversalIdentifier) &&
      isDefined(predicateGroup.rowLevelPermissionRuleUniversalIdentifier) &&
      !isDefined(
        predicateGroup.parentRowLevelPermissionPredicateGroupUniversalIdentifier,
      )
    ) {
      declaredRuleUniversalIdentifierByDerivedRuleUniversalIdentifier.set(
        derivedRuleUniversalIdentifier,
        predicateGroup.rowLevelPermissionRuleUniversalIdentifier,
      );
    }
  }

  const undeclaredRuleUniversalIdentifiers = new Set<string>();

  const resolveRuleUniversalIdentifier = ({
    declaredRuleUniversalIdentifier,
    derivedRuleUniversalIdentifier,
  }: {
    declaredRuleUniversalIdentifier: string | null | undefined;
    derivedRuleUniversalIdentifier: string | undefined;
  }): string | null => {
    if (isDefined(declaredRuleUniversalIdentifier)) {
      return declaredRuleUniversalIdentifier;
    }

    if (!isDefined(derivedRuleUniversalIdentifier)) {
      return null;
    }

    undeclaredRuleUniversalIdentifiers.add(derivedRuleUniversalIdentifier);

    return derivedRuleUniversalIdentifier;
  };

  const linkedPredicateGroups = predicateGroups.map((predicateGroup) => {
    const derivedRuleUniversalIdentifier =
      ruleUniversalIdentifierByPredicateGroupUniversalIdentifier.get(
        predicateGroup.universalIdentifier,
      );

    return {
      ...predicateGroup,
      rowLevelPermissionRuleUniversalIdentifier: resolveRuleUniversalIdentifier(
        {
          declaredRuleUniversalIdentifier: isDefined(
            derivedRuleUniversalIdentifier,
          )
            ? declaredRuleUniversalIdentifierByDerivedRuleUniversalIdentifier.get(
                derivedRuleUniversalIdentifier,
              )
            : undefined,
          derivedRuleUniversalIdentifier,
        },
      ),
    };
  });

  const linkedPredicates = predicates.map((predicate) => {
    const derivedRuleUniversalIdentifier =
      ruleUniversalIdentifierByPredicateUniversalIdentifier.get(
        predicate.universalIdentifier,
      );
    const isInPredicateGroup = isDefined(
      predicate.rowLevelPermissionPredicateGroupUniversalIdentifier,
    );

    return {
      ...predicate,
      rowLevelPermissionRuleUniversalIdentifier: resolveRuleUniversalIdentifier(
        {
          declaredRuleUniversalIdentifier:
            isInPredicateGroup && isDefined(derivedRuleUniversalIdentifier)
              ? declaredRuleUniversalIdentifierByDerivedRuleUniversalIdentifier.get(
                  derivedRuleUniversalIdentifier,
                )
              : predicate.rowLevelPermissionRuleUniversalIdentifier,
          derivedRuleUniversalIdentifier,
        },
      ),
    };
  });

  const objectPermissionByObjectUniversalIdentifier = new Map(
    universalFlatObjectPermissions.map((universalFlatObjectPermission) => [
      universalFlatObjectPermission.objectMetadataUniversalIdentifier,
      universalFlatObjectPermission,
    ]),
  );

  const undeclaredRules = derivedRules
    .filter(({ universalIdentifier }) =>
      undeclaredRuleUniversalIdentifiers.has(universalIdentifier),
    )
    .map((rule) => {
      const objectPermission = objectPermissionByObjectUniversalIdentifier.get(
        rule.objectMetadataUniversalIdentifier,
      );

      return {
        ...rule,
        canReadRecords:
          objectPermission?.canReadObjectRecords ??
          universalFlatRole.canReadAllObjectRecords,
        canCreateRecords:
          objectPermission?.canCreateObjectRecords ??
          universalFlatRole.canCreateAllObjectRecords,
        canUpdateRecords:
          objectPermission?.canUpdateObjectRecords ??
          universalFlatRole.canUpdateAllObjectRecords,
        canSoftDeleteRecords:
          objectPermission?.canSoftDeleteObjectRecords ??
          universalFlatRole.canSoftDeleteAllObjectRecords,
        canDestroyRecords:
          objectPermission?.canDestroyObjectRecords ??
          universalFlatRole.canDestroyAllObjectRecords,
      };
    });

  // All records wins over the rules, so an undeclared rule takes the object grant over
  const objectUniversalIdentifiersWithUndeclaredRule = new Set(
    undeclaredRules.map(
      ({ objectMetadataUniversalIdentifier }) =>
        objectMetadataUniversalIdentifier,
    ),
  );

  const objectPermissions = [
    ...universalFlatObjectPermissions.map((universalFlatObjectPermission) =>
      objectUniversalIdentifiersWithUndeclaredRule.has(
        universalFlatObjectPermission.objectMetadataUniversalIdentifier,
      )
        ? { ...universalFlatObjectPermission, ...NO_OBJECT_RECORDS_GRANTS }
        : universalFlatObjectPermission,
    ),
    ...[...objectUniversalIdentifiersWithUndeclaredRule]
      .filter(
        (objectUniversalIdentifier) =>
          !objectPermissionByObjectUniversalIdentifier.has(
            objectUniversalIdentifier,
          ),
      )
      .map((objectUniversalIdentifier) => ({
        universalIdentifier: getObjectPermissionUniversalIdentifier({
          applicationUniversalIdentifier:
            universalFlatRole.applicationUniversalIdentifier,
          roleUniversalIdentifier: universalFlatRole.universalIdentifier,
          objectUniversalIdentifier,
        }),
        applicationUniversalIdentifier:
          universalFlatRole.applicationUniversalIdentifier,
        roleUniversalIdentifier: universalFlatRole.universalIdentifier,
        objectMetadataUniversalIdentifier: objectUniversalIdentifier,
        ...NO_OBJECT_RECORDS_GRANTS,
        createdAt: now,
        updatedAt: now,
      })),
  ];

  return {
    rules: [...declaredRules, ...undeclaredRules],
    predicateGroups: linkedPredicateGroups,
    predicates: linkedPredicates,
    objectPermissions,
  };
};
