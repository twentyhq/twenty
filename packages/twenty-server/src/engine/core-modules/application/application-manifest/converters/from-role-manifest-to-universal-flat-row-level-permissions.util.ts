import {
  flattenRowLevelPermissionRuleManifests,
  type RoleManifest,
} from 'twenty-shared/application';

import { fromObjectPermissionManifestToUniversalFlatObjectPermission } from 'src/engine/core-modules/application/application-manifest/converters/from-object-permission-manifest-to-universal-flat-object-permission.util';
import { fromRowLevelPermissionPredicateGroupManifestToUniversalFlatRowLevelPermissionPredicateGroup } from 'src/engine/core-modules/application/application-manifest/converters/from-row-level-permission-predicate-group-manifest-to-universal-flat-row-level-permission-predicate-group.util';
import { fromRowLevelPermissionPredicateManifestToUniversalFlatRowLevelPermissionPredicate } from 'src/engine/core-modules/application/application-manifest/converters/from-row-level-permission-predicate-manifest-to-universal-flat-row-level-permission-predicate.util';
import { fromRowLevelPermissionRuleManifestToUniversalFlatRowLevelPermissionRule } from 'src/engine/core-modules/application/application-manifest/converters/from-row-level-permission-rule-manifest-to-universal-flat-row-level-permission-rule.util';
import { deriveUndeclaredRowLevelPermissionRules } from 'src/engine/core-modules/application/application-manifest/utils/derive-undeclared-row-level-permission-rules.util';
import { type UniversalFlatObjectPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-permission.type';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { type UniversalFlatRowLevelPermissionPredicateGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate-group.type';
import { type UniversalFlatRowLevelPermissionPredicate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate.type';
import { type UniversalFlatRowLevelPermissionRule } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-rule.type';

export const fromRoleManifestToUniversalFlatRowLevelPermissions = ({
  roleManifest,
  universalFlatRole,
  now,
}: {
  roleManifest: Pick<
    RoleManifest,
    | 'objectPermissions'
    | 'rowLevelPermissionRules'
    | 'rowLevelPermissionPredicateGroups'
    | 'rowLevelPermissionPredicates'
  >;
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
  now: string;
}): {
  rules: UniversalFlatRowLevelPermissionRule[];
  predicateGroups: UniversalFlatRowLevelPermissionPredicateGroup[];
  predicates: UniversalFlatRowLevelPermissionPredicate[];
  objectPermissions: UniversalFlatObjectPermission[];
} => {
  const owner = {
    roleUniversalIdentifier: universalFlatRole.universalIdentifier,
    applicationUniversalIdentifier:
      universalFlatRole.applicationUniversalIdentifier,
    now,
  };

  const ruleManifests = roleManifest.rowLevelPermissionRules ?? [];
  const declaredRules = ruleManifests.map((rowLevelPermissionRuleManifest) =>
    fromRowLevelPermissionRuleManifestToUniversalFlatRowLevelPermissionRule({
      rowLevelPermissionRuleManifest,
      ...owner,
    }),
  );
  const declared = flattenRowLevelPermissionRuleManifests({
    rules: ruleManifests,
  });

  const undeclared = deriveUndeclaredRowLevelPermissionRules({
    universalFlatRole,
    universalFlatObjectPermissions: (roleManifest.objectPermissions ?? []).map(
      (objectPermissionManifest) =>
        fromObjectPermissionManifestToUniversalFlatObjectPermission({
          objectPermissionManifest,
          ...owner,
        }),
    ),
    declaredRuleUniversalIdentifiers: new Set(
      declaredRules.map(({ universalIdentifier }) => universalIdentifier),
    ),
    predicateGroups: (roleManifest.rowLevelPermissionPredicateGroups ?? []).map(
      (rowLevelPermissionPredicateGroupManifest) =>
        fromRowLevelPermissionPredicateGroupManifestToUniversalFlatRowLevelPermissionPredicateGroup(
          { rowLevelPermissionPredicateGroupManifest, ...owner },
        ),
    ),
    predicates: (roleManifest.rowLevelPermissionPredicates ?? []).map(
      (rowLevelPermissionPredicateManifest) =>
        fromRowLevelPermissionPredicateManifestToUniversalFlatRowLevelPermissionPredicate(
          { rowLevelPermissionPredicateManifest, ...owner },
        ),
    ),
    now,
  });

  return {
    rules: [...declaredRules, ...undeclared.rules],
    predicateGroups: [
      ...declared.predicateGroups.map(
        ({
          rowLevelPermissionRuleUniversalIdentifier,
          ...rowLevelPermissionPredicateGroupManifest
        }) => ({
          ...fromRowLevelPermissionPredicateGroupManifestToUniversalFlatRowLevelPermissionPredicateGroup(
            { rowLevelPermissionPredicateGroupManifest, ...owner },
          ),
          rowLevelPermissionRuleUniversalIdentifier,
        }),
      ),
      ...undeclared.predicateGroups,
    ],
    predicates: [
      ...declared.predicates.map(
        ({
          rowLevelPermissionRuleUniversalIdentifier,
          ...rowLevelPermissionPredicateManifest
        }) => ({
          ...fromRowLevelPermissionPredicateManifestToUniversalFlatRowLevelPermissionPredicate(
            { rowLevelPermissionPredicateManifest, ...owner },
          ),
          rowLevelPermissionRuleUniversalIdentifier,
        }),
      ),
      ...undeclared.predicates,
    ],
    objectPermissions: undeclared.objectPermissions,
  };
};
