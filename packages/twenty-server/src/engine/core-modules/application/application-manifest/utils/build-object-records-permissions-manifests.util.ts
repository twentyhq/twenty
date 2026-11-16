import {
  type FieldRestrictionsManifest,
  getFieldPermissionUniversalIdentifier,
  type ObjectRecordsPermissionsManifest,
  type RowLevelPermissionRuleManifest,
} from 'twenty-shared/application';
import { isNonEmptyArray } from 'twenty-shared/utils';

type AllRecordsPermissionsManifest = Omit<
  ObjectRecordsPermissionsManifest,
  'rowLevelRecordsPermissions' | keyof FieldRestrictionsManifest
>;

type FieldRestriction = {
  objectUniversalIdentifier: string;
  fieldUniversalIdentifier: string;
  rowLevelPermissionRuleUniversalIdentifier: string | null;
  canReadFieldValue: boolean | null;
  canUpdateFieldValue: boolean | null;
  universalIdentifier: string;
  applicationUniversalIdentifier: string;
  roleUniversalIdentifier: string;
};

// The import stores a rule's field permissions on its first predicate group, which decides their derived identifier
const buildFieldLists = ({
  fieldRestrictions,
  predicateGroupUniversalIdentifier,
}: {
  fieldRestrictions: FieldRestriction[];
  predicateGroupUniversalIdentifier: string | null;
}): FieldRestrictionsManifest => {
  const unreadableFields = fieldRestrictions
    .filter(({ canReadFieldValue }) => canReadFieldValue === false)
    .map(({ fieldUniversalIdentifier }) => fieldUniversalIdentifier);
  const uneditableFields = fieldRestrictions
    .filter(({ canUpdateFieldValue }) => canUpdateFieldValue === false)
    .map(({ fieldUniversalIdentifier }) => fieldUniversalIdentifier);
  const fieldPermissionIdentifiers = fieldRestrictions
    .filter(
      ({
        universalIdentifier,
        applicationUniversalIdentifier,
        roleUniversalIdentifier,
        fieldUniversalIdentifier,
      }) =>
        universalIdentifier !==
        getFieldPermissionUniversalIdentifier({
          applicationUniversalIdentifier,
          roleUniversalIdentifier,
          fieldUniversalIdentifier,
          rowLevelPermissionPredicateGroupUniversalIdentifier:
            predicateGroupUniversalIdentifier,
        }),
    )
    .map(({ fieldUniversalIdentifier, universalIdentifier }) => ({
      fieldUniversalIdentifier,
      universalIdentifier,
    }));

  return {
    ...(isNonEmptyArray(unreadableFields) ? { unreadableFields } : {}),
    ...(isNonEmptyArray(uneditableFields) ? { uneditableFields } : {}),
    ...(isNonEmptyArray(fieldPermissionIdentifiers)
      ? { fieldPermissionIdentifiers }
      : {}),
  };
};

export const buildObjectRecordsPermissionsManifests = ({
  allRecordsPermissions,
  rowLevelPermissionRules,
  fieldRestrictions,
}: {
  allRecordsPermissions: AllRecordsPermissionsManifest[];
  rowLevelPermissionRules: RowLevelPermissionRuleManifest[];
  fieldRestrictions: FieldRestriction[];
}): ObjectRecordsPermissionsManifest[] => {
  const objectUniversalIdentifiersWithAllRecordsPermissions = new Set(
    allRecordsPermissions.map(
      ({ objectUniversalIdentifier }) => objectUniversalIdentifier,
    ),
  );
  const objectUniversalIdentifiersWithoutAllRecordsPermissions = [
    ...new Set(
      [...rowLevelPermissionRules, ...fieldRestrictions]
        .map(({ objectUniversalIdentifier }) => objectUniversalIdentifier)
        .filter(
          (objectUniversalIdentifier) =>
            !objectUniversalIdentifiersWithAllRecordsPermissions.has(
              objectUniversalIdentifier,
            ),
        ),
    ),
  ];

  return [
    ...allRecordsPermissions,
    ...objectUniversalIdentifiersWithoutAllRecordsPermissions.map(
      (objectUniversalIdentifier): AllRecordsPermissionsManifest => ({
        objectUniversalIdentifier,
      }),
    ),
  ].map((objectRecordsPermissions) => {
    const { objectUniversalIdentifier } = objectRecordsPermissions;
    const rowLevelRecordsPermissions = rowLevelPermissionRules
      .filter(
        (rule) => rule.objectUniversalIdentifier === objectUniversalIdentifier,
      )
      .map(
        ({
          objectUniversalIdentifier: _objectUniversalIdentifier,
          ...rule
        }) => ({
          ...rule,
          ...buildFieldLists({
            fieldRestrictions: fieldRestrictions.filter(
              ({ rowLevelPermissionRuleUniversalIdentifier }) =>
                rowLevelPermissionRuleUniversalIdentifier ===
                rule.universalIdentifier,
            ),
            predicateGroupUniversalIdentifier:
              rule.predicateGroups?.[0]?.universalIdentifier ?? null,
          }),
        }),
      );

    return {
      ...objectRecordsPermissions,
      ...buildFieldLists({
        fieldRestrictions: fieldRestrictions.filter(
          (fieldRestriction) =>
            fieldRestriction.objectUniversalIdentifier ===
              objectUniversalIdentifier &&
            fieldRestriction.rowLevelPermissionRuleUniversalIdentifier === null,
        ),
        predicateGroupUniversalIdentifier: null,
      }),
      ...(isNonEmptyArray(rowLevelRecordsPermissions)
        ? { rowLevelRecordsPermissions }
        : {}),
    };
  });
};
