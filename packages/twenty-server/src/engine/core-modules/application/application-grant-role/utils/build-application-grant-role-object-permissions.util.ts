import { isDefined } from 'twenty-shared/utils';

import { type UniversalFlatObjectPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-permission.type';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { type UniversalFlatRowLevelPermissionRule } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-rule.type';

type ObjectRecordsGrants = Pick<
  UniversalFlatObjectPermission,
  | 'canReadObjectRecords'
  | 'canCreateObjectRecords'
  | 'canUpdateObjectRecords'
  | 'canSoftDeleteObjectRecords'
  | 'canDestroyObjectRecords'
>;

// A limiting role carries no RLS, so an operation one of its rules grants becomes an all-records grant
export const buildApplicationGrantRoleObjectPermissions = <
  TObjectPermission extends ObjectRecordsGrants & {
    objectMetadataUniversalIdentifier: string;
  },
>({
  objectPermissions,
  rules,
  roleGrants,
  buildObjectPermission,
}: {
  objectPermissions: TObjectPermission[];
  rules: Pick<
    UniversalFlatRowLevelPermissionRule,
    | 'objectMetadataUniversalIdentifier'
    | 'canReadRecords'
    | 'canCreateRecords'
    | 'canUpdateRecords'
    | 'canSoftDeleteRecords'
    | 'canDestroyRecords'
  >[];
  roleGrants: Pick<
    UniversalFlatRole,
    | 'canReadAllObjectRecords'
    | 'canCreateAllObjectRecords'
    | 'canUpdateAllObjectRecords'
    | 'canSoftDeleteAllObjectRecords'
    | 'canDestroyAllObjectRecords'
  >;
  buildObjectPermission: (args: {
    objectMetadataUniversalIdentifier: string;
    grants: ObjectRecordsGrants;
  }) => TObjectPermission;
}): TObjectPermission[] => {
  const ruleGrantsByObjectUniversalIdentifier = new Map<
    string,
    Record<keyof ObjectRecordsGrants, boolean>
  >();

  for (const rule of rules) {
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

  const mergeGrants = ({
    objectRecordsGrants,
    ruleGrants,
  }: {
    objectRecordsGrants: ObjectRecordsGrants | undefined;
    ruleGrants: Record<keyof ObjectRecordsGrants, boolean>;
  }): ObjectRecordsGrants => ({
    canReadObjectRecords:
      (objectRecordsGrants?.canReadObjectRecords ??
        roleGrants.canReadAllObjectRecords) ||
      ruleGrants.canReadObjectRecords,
    canCreateObjectRecords:
      (objectRecordsGrants?.canCreateObjectRecords ??
        roleGrants.canCreateAllObjectRecords) ||
      ruleGrants.canCreateObjectRecords,
    canUpdateObjectRecords:
      (objectRecordsGrants?.canUpdateObjectRecords ??
        roleGrants.canUpdateAllObjectRecords) ||
      ruleGrants.canUpdateObjectRecords,
    canSoftDeleteObjectRecords:
      (objectRecordsGrants?.canSoftDeleteObjectRecords ??
        roleGrants.canSoftDeleteAllObjectRecords) ||
      ruleGrants.canSoftDeleteObjectRecords,
    canDestroyObjectRecords:
      (objectRecordsGrants?.canDestroyObjectRecords ??
        roleGrants.canDestroyAllObjectRecords) ||
      ruleGrants.canDestroyObjectRecords,
  });

  const objectUniversalIdentifiersWithObjectPermission = new Set(
    objectPermissions.map(
      ({ objectMetadataUniversalIdentifier }) =>
        objectMetadataUniversalIdentifier,
    ),
  );

  return [
    ...objectPermissions.map((objectPermission) => {
      const ruleGrants = ruleGrantsByObjectUniversalIdentifier.get(
        objectPermission.objectMetadataUniversalIdentifier,
      );

      return isDefined(ruleGrants)
        ? {
            ...objectPermission,
            ...mergeGrants({
              objectRecordsGrants: objectPermission,
              ruleGrants,
            }),
          }
        : objectPermission;
    }),
    ...[...ruleGrantsByObjectUniversalIdentifier]
      .filter(
        ([objectMetadataUniversalIdentifier]) =>
          !objectUniversalIdentifiersWithObjectPermission.has(
            objectMetadataUniversalIdentifier,
          ),
      )
      .map(([objectMetadataUniversalIdentifier, ruleGrants]) =>
        buildObjectPermission({
          objectMetadataUniversalIdentifier,
          grants: mergeGrants({ objectRecordsGrants: undefined, ruleGrants }),
        }),
      ),
  ];
};
