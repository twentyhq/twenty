import { msg } from '@lingui/core/macro';
import {
  type FieldRestrictionsManifest,
  flattenRowLevelPermissionRuleManifests,
  getFieldPermissionUniversalIdentifier,
  type RoleManifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { fromObjectRecordsPermissionsManifestToUniversalFlatObjectPermission } from 'src/engine/core-modules/application/application-manifest/converters/from-object-records-permissions-manifest-to-universal-flat-object-permission.util';
import { fromRowLevelPermissionPredicateGroupManifestToUniversalFlatRowLevelPermissionPredicateGroup } from 'src/engine/core-modules/application/application-manifest/converters/from-row-level-permission-predicate-group-manifest-to-universal-flat-row-level-permission-predicate-group.util';
import { fromRowLevelPermissionPredicateManifestToUniversalFlatRowLevelPermissionPredicate } from 'src/engine/core-modules/application/application-manifest/converters/from-row-level-permission-predicate-manifest-to-universal-flat-row-level-permission-predicate.util';
import { fromRowLevelPermissionRuleManifestToUniversalFlatRowLevelPermissionRule } from 'src/engine/core-modules/application/application-manifest/converters/from-row-level-permission-rule-manifest-to-universal-flat-row-level-permission-rule.util';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type UniversalFlatFieldPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-permission.type';
import { type UniversalFlatObjectPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-permission.type';
import { type UniversalFlatRowLevelPermissionPredicateGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate-group.type';
import { type UniversalFlatRowLevelPermissionPredicate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-predicate.type';
import { type UniversalFlatRowLevelPermissionRule } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-rule.type';

const ALL_RECORDS_PERMISSION_KEYS = [
  'canReadAllRecords',
  'canCreateAllRecords',
  'canUpdateAllRecords',
  'canSoftDeleteAllRecords',
  'canDestroyAllRecords',
] as const;

export const fromRoleManifestToUniversalFlatRecordsPermissionsOrThrow = ({
  roleManifest,
  applicationUniversalIdentifier,
  now,
}: {
  roleManifest: RoleManifest;
  applicationUniversalIdentifier: string;
  now: string;
}): {
  objectPermissions: UniversalFlatObjectPermission[];
  fieldPermissions: UniversalFlatFieldPermission[];
  rules: UniversalFlatRowLevelPermissionRule[];
  predicateGroups: UniversalFlatRowLevelPermissionPredicateGroup[];
  predicates: UniversalFlatRowLevelPermissionPredicate[];
} => {
  const roleUniversalIdentifier = roleManifest.universalIdentifier;
  const owner = {
    roleUniversalIdentifier,
    applicationUniversalIdentifier,
    now,
  };
  const { objects } = roleManifest.recordsPermissions;

  const buildFieldPermissions = ({
    objectUniversalIdentifier,
    unreadableFields = [],
    uneditableFields = [],
    fieldPermissionIdentifiers = [],
    rowLevelPermissionRuleUniversalIdentifier,
    rowLevelPermissionPredicateGroupUniversalIdentifier,
  }: FieldRestrictionsManifest & {
    objectUniversalIdentifier: string;
    rowLevelPermissionRuleUniversalIdentifier: string | null;
    rowLevelPermissionPredicateGroupUniversalIdentifier: string | null;
  }): UniversalFlatFieldPermission[] =>
    // A declared field permission that restricts nothing still gets its row, so a stored restriction is lifted
    [
      ...new Set([
        ...unreadableFields,
        ...uneditableFields,
        ...fieldPermissionIdentifiers.map(
          ({ fieldUniversalIdentifier }) => fieldUniversalIdentifier,
        ),
      ]),
    ].map((fieldUniversalIdentifier) => ({
      universalIdentifier:
        fieldPermissionIdentifiers.find(
          (fieldPermissionIdentifier) =>
            fieldPermissionIdentifier.fieldUniversalIdentifier ===
            fieldUniversalIdentifier,
        )?.universalIdentifier ??
        getFieldPermissionUniversalIdentifier({
          applicationUniversalIdentifier,
          roleUniversalIdentifier,
          fieldUniversalIdentifier,
          rowLevelPermissionPredicateGroupUniversalIdentifier,
        }),
      applicationUniversalIdentifier,
      roleUniversalIdentifier,
      objectMetadataUniversalIdentifier: objectUniversalIdentifier,
      fieldMetadataUniversalIdentifier: fieldUniversalIdentifier,
      rowLevelPermissionPredicateGroupUniversalIdentifier,
      rowLevelPermissionRuleUniversalIdentifier,
      canReadFieldValue: unreadableFields.includes(fieldUniversalIdentifier)
        ? false
        : null,
      canUpdateFieldValue: uneditableFields.includes(fieldUniversalIdentifier)
        ? false
        : null,
      createdAt: now,
      updatedAt: now,
    }));

  const rules = objects.flatMap(
    ({ objectUniversalIdentifier, rowLevelRecordsPermissions = [] }) =>
      rowLevelRecordsPermissions.map((rowLevelRecordsPermissions) => ({
        ...rowLevelRecordsPermissions,
        objectUniversalIdentifier,
      })),
  );
  const flattened = flattenRowLevelPermissionRuleManifests({ rules });

  return {
    objectPermissions: objects
      .filter(
        (objectRecordsPermissionsManifest) =>
          isDefined(objectRecordsPermissionsManifest.universalIdentifier) ||
          ALL_RECORDS_PERMISSION_KEYS.some((allRecordsPermissionKey) =>
            isDefined(
              objectRecordsPermissionsManifest[allRecordsPermissionKey],
            ),
          ),
      )
      .map((objectRecordsPermissionsManifest) =>
        fromObjectRecordsPermissionsManifestToUniversalFlatObjectPermission({
          objectRecordsPermissionsManifest,
          ...owner,
        }),
      ),
    fieldPermissions: [
      ...objects.flatMap((objectRecordsPermissionsManifest) =>
        buildFieldPermissions({
          ...objectRecordsPermissionsManifest,
          rowLevelPermissionRuleUniversalIdentifier: null,
          rowLevelPermissionPredicateGroupUniversalIdentifier: null,
        }),
      ),
      ...rules.flatMap((rule) => {
        const hasFieldRestrictions =
          (rule.unreadableFields ?? []).length > 0 ||
          (rule.uneditableFields ?? []).length > 0;
        const predicateGroupUniversalIdentifier =
          rule.predicateGroups?.[0]?.universalIdentifier;

        if (!hasFieldRestrictions) {
          return [];
        }

        if (!isDefined(predicateGroupUniversalIdentifier)) {
          throw new ApplicationException(
            `Row level records permissions ${rule.universalIdentifier} declare unreadable or uneditable fields but no predicate group to hold them`,
            ApplicationExceptionCode.INVALID_INPUT,
            {
              userFriendlyMessage: msg`Row level records permissions that hide or lock fields need at least one predicate group.`,
            },
          );
        }

        return buildFieldPermissions({
          ...rule,
          rowLevelPermissionRuleUniversalIdentifier: rule.universalIdentifier,
          rowLevelPermissionPredicateGroupUniversalIdentifier:
            predicateGroupUniversalIdentifier,
        });
      }),
    ],
    rules: rules.map((rowLevelPermissionRuleManifest) =>
      fromRowLevelPermissionRuleManifestToUniversalFlatRowLevelPermissionRule({
        rowLevelPermissionRuleManifest,
        ...owner,
      }),
    ),
    predicateGroups: flattened.predicateGroups.map(
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
    predicates: flattened.predicates.map(
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
  };
};
