import { getObjectPermissionUniversalIdentifier } from 'twenty-shared/application';

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

// TODO(charles): drop once published applications declare their predicates inside rules
export const deriveUndeclaredRowLevelPermissionRules = ({
  universalFlatRole,
  universalFlatObjectPermissions,
  declaredRuleUniversalIdentifiers,
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
  declaredRuleUniversalIdentifiers: ReadonlySet<string>;
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

  const objectPermissionByObjectUniversalIdentifier = new Map(
    universalFlatObjectPermissions.map((universalFlatObjectPermission) => [
      universalFlatObjectPermission.objectMetadataUniversalIdentifier,
      universalFlatObjectPermission,
    ]),
  );

  const rules = derivedRules
    .filter(
      ({ universalIdentifier }) =>
        !declaredRuleUniversalIdentifiers.has(universalIdentifier),
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

  // All records wins over the rules, so a derived rule takes the object grant over
  const objectUniversalIdentifiersWithDerivedRule = new Set(
    rules.map(
      ({ objectMetadataUniversalIdentifier }) =>
        objectMetadataUniversalIdentifier,
    ),
  );

  const objectPermissions = [
    ...universalFlatObjectPermissions.map((universalFlatObjectPermission) =>
      objectUniversalIdentifiersWithDerivedRule.has(
        universalFlatObjectPermission.objectMetadataUniversalIdentifier,
      )
        ? { ...universalFlatObjectPermission, ...NO_OBJECT_RECORDS_GRANTS }
        : universalFlatObjectPermission,
    ),
    ...[...objectUniversalIdentifiersWithDerivedRule]
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
    rules,
    predicateGroups: predicateGroups.map((predicateGroup) => ({
      ...predicateGroup,
      rowLevelPermissionRuleUniversalIdentifier:
        ruleUniversalIdentifierByPredicateGroupUniversalIdentifier.get(
          predicateGroup.universalIdentifier,
        ) ?? null,
    })),
    predicates: predicates.map((predicate) => ({
      ...predicate,
      rowLevelPermissionRuleUniversalIdentifier:
        ruleUniversalIdentifierByPredicateUniversalIdentifier.get(
          predicate.universalIdentifier,
        ) ?? null,
    })),
    objectPermissions,
  };
};
