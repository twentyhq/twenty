import { isDefined } from 'twenty-shared/utils';

import { type UniversalFlatObjectPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-permission.type';
import { type UniversalFlatRowLevelPermissionRule } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-rule.type';

type ObjectRecordsGrants = Pick<
  UniversalFlatObjectPermission,
  | 'canReadObjectRecords'
  | 'canCreateObjectRecords'
  | 'canUpdateObjectRecords'
  | 'canSoftDeleteObjectRecords'
  | 'canDestroyObjectRecords'
>;

// Reads stored flat entities, not a manifest. A grant role carries no rule,
// so what a rule of the requested role grants becomes an all-records grant
export const buildApplicationGrantRoleObjectPermissions = <
  TGrantRoleFlatObjectPermission extends ObjectRecordsGrants & {
    objectMetadataUniversalIdentifier: string;
  },
>({
  grantRoleFlatObjectPermissions,
  requestedRoleFlatRowLevelPermissionRules,
  buildGrantRoleFlatObjectPermission,
}: {
  grantRoleFlatObjectPermissions: TGrantRoleFlatObjectPermission[];
  requestedRoleFlatRowLevelPermissionRules: Pick<
    UniversalFlatRowLevelPermissionRule,
    | 'objectMetadataUniversalIdentifier'
    | 'canReadRecords'
    | 'canCreateRecords'
    | 'canUpdateRecords'
    | 'canSoftDeleteRecords'
    | 'canDestroyRecords'
  >[];
  buildGrantRoleFlatObjectPermission: (args: {
    objectMetadataUniversalIdentifier: string;
    grants: ObjectRecordsGrants;
  }) => TGrantRoleFlatObjectPermission;
}): TGrantRoleFlatObjectPermission[] => {
  const ruleGrantsByObjectUniversalIdentifier = new Map<
    string,
    Record<keyof ObjectRecordsGrants, boolean>
  >();

  for (const rule of requestedRoleFlatRowLevelPermissionRules) {
    const grants = ruleGrantsByObjectUniversalIdentifier.get(
      rule.objectMetadataUniversalIdentifier,
    );

    ruleGrantsByObjectUniversalIdentifier.set(
      rule.objectMetadataUniversalIdentifier,
      {
        canReadObjectRecords:
          (grants?.canReadObjectRecords ?? false) || rule.canReadRecords,
        canCreateObjectRecords:
          (grants?.canCreateObjectRecords ?? false) || rule.canCreateRecords,
        canUpdateObjectRecords:
          (grants?.canUpdateObjectRecords ?? false) || rule.canUpdateRecords,
        canSoftDeleteObjectRecords:
          (grants?.canSoftDeleteObjectRecords ?? false) ||
          rule.canSoftDeleteRecords,
        canDestroyObjectRecords:
          (grants?.canDestroyObjectRecords ?? false) || rule.canDestroyRecords,
      },
    );
  }

  // Null keeps the default of the role and of system objects
  const addRuleGrants = ({
    objectRecordsGrants,
    ruleGrants,
  }: {
    objectRecordsGrants: ObjectRecordsGrants | undefined;
    ruleGrants: Record<keyof ObjectRecordsGrants, boolean>;
  }): ObjectRecordsGrants => ({
    canReadObjectRecords:
      ruleGrants.canReadObjectRecords ||
      (objectRecordsGrants?.canReadObjectRecords ?? null),
    canCreateObjectRecords:
      ruleGrants.canCreateObjectRecords ||
      (objectRecordsGrants?.canCreateObjectRecords ?? null),
    canUpdateObjectRecords:
      ruleGrants.canUpdateObjectRecords ||
      (objectRecordsGrants?.canUpdateObjectRecords ?? null),
    canSoftDeleteObjectRecords:
      ruleGrants.canSoftDeleteObjectRecords ||
      (objectRecordsGrants?.canSoftDeleteObjectRecords ?? null),
    canDestroyObjectRecords:
      ruleGrants.canDestroyObjectRecords ||
      (objectRecordsGrants?.canDestroyObjectRecords ?? null),
  });

  const objectUniversalIdentifiersWithObjectPermission = new Set(
    grantRoleFlatObjectPermissions.map(
      ({ objectMetadataUniversalIdentifier }) =>
        objectMetadataUniversalIdentifier,
    ),
  );

  return [
    ...grantRoleFlatObjectPermissions.map((objectPermission) => {
      const ruleGrants = ruleGrantsByObjectUniversalIdentifier.get(
        objectPermission.objectMetadataUniversalIdentifier,
      );

      return isDefined(ruleGrants)
        ? {
            ...objectPermission,
            ...addRuleGrants({
              objectRecordsGrants: objectPermission,
              ruleGrants,
            }),
          }
        : objectPermission;
    }),
    ...[...ruleGrantsByObjectUniversalIdentifier]
      .filter(
        ([objectMetadataUniversalIdentifier, ruleGrants]) =>
          !objectUniversalIdentifiersWithObjectPermission.has(
            objectMetadataUniversalIdentifier,
          ) && Object.values(ruleGrants).some(Boolean),
      )
      .map(([objectMetadataUniversalIdentifier, ruleGrants]) =>
        buildGrantRoleFlatObjectPermission({
          objectMetadataUniversalIdentifier,
          grants: addRuleGrants({ objectRecordsGrants: undefined, ruleGrants }),
        }),
      ),
  ];
};
