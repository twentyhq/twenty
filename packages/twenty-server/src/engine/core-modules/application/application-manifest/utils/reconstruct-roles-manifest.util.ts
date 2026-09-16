import {
  type FieldPermissionManifest,
  type ObjectPermissionManifest,
  type PermissionFlagManifest,
  type RoleManifest,
} from 'twenty-shared/application';

import { fromFlatFieldPermissionToFieldPermissionManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-field-permission-to-field-permission-manifest.util';
import { fromFlatObjectPermissionToObjectPermissionManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-object-permission-to-object-permission-manifest.util';
import { fromFlatPermissionFlagToPermissionFlagManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-permission-flag-to-permission-flag-manifest.util';
import { fromFlatRoleToRoleManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-role-to-role-manifest.util';
import { type ApplicationExportCoverageEntry } from 'src/engine/core-modules/application/application-manifest/types/application-export.type';
import {
  type ChildMetadataName,
  type ParentStatus,
} from 'src/engine/core-modules/application/application-manifest/types/export-classification.type';
import { buildExportedCoverageEntry } from 'src/engine/core-modules/application/application-manifest/utils/build-exported-coverage-entry.util';
import { compareByCodePoint } from 'src/engine/core-modules/application/application-manifest/utils/compare-by-code-point.util';
import { createChildDecider } from 'src/engine/core-modules/application/application-manifest/utils/create-child-decider.util';
import { getUnresolvableReferenceReason } from 'src/engine/core-modules/application/application-manifest/utils/get-unresolvable-reference-reason.util';
import { reconstructRowLevelPermissionPredicatesManifest } from 'src/engine/core-modules/application/application-manifest/utils/reconstruct-row-level-permission-predicates-manifest.util';
import { sortFlatEntitiesByUniversalIdentifier } from 'src/engine/core-modules/application/application-manifest/utils/sort-flat-entities-by-universal-identifier.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type UniversalFlatFieldPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-permission.type';
import { type UniversalFlatObjectPermission } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-permission.type';
import { type UniversalFlatRolePermissionFlag } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role-permission-flag.type';

type FlatRoleChild =
  | UniversalFlatObjectPermission
  | UniversalFlatFieldPermission
  | UniversalFlatRolePermissionFlag;

type RoleChildren = {
  objectPermissions: ObjectPermissionManifest[];
  fieldPermissions: FieldPermissionManifest[];
  permissionFlagUniversalIdentifiers: string[];
};

export const reconstructRolesManifest = ({
  applicationAllFlatEntityMaps,
  allFlatEntityMaps,
  exportedObjectUniversalIdentifiers,
  resolvableFieldUniversalIdentifiers,
}: {
  applicationAllFlatEntityMaps: AllFlatEntityMaps;
  allFlatEntityMaps: AllFlatEntityMaps;
  exportedObjectUniversalIdentifiers: ReadonlySet<string>;
  resolvableFieldUniversalIdentifiers: ReadonlySet<string>;
}): {
  permissionFlags: PermissionFlagManifest[];
  roles: RoleManifest[];
  coverage: ApplicationExportCoverageEntry[];
} => {
  const coverage: ApplicationExportCoverageEntry[] = [];

  const permissionFlags = sortFlatEntitiesByUniversalIdentifier(
    applicationAllFlatEntityMaps.flatPermissionFlagMaps,
  ).map((flatPermissionFlag) => {
    coverage.push(
      buildExportedCoverageEntry({
        metadataName: 'permissionFlag',
        flatEntity: flatPermissionFlag,
      }),
    );

    return fromFlatPermissionFlagToPermissionFlagManifest({
      flatPermissionFlag,
    });
  });
  const exportedPermissionFlagUniversalIdentifiers = new Set(
    permissionFlags.map(({ universalIdentifier }) => universalIdentifier),
  );

  const flatRoles = sortFlatEntitiesByUniversalIdentifier(
    applicationAllFlatEntityMaps.flatRoleMaps,
  );
  const parentRoleStatusByUniversalIdentifier = new Map<string, ParentStatus>(
    flatRoles.map(({ universalIdentifier }) => [
      universalIdentifier,
      'exported',
    ]),
  );
  const childrenByRoleUniversalIdentifier = new Map<string, RoleChildren>(
    flatRoles.map(({ universalIdentifier }) => [
      universalIdentifier,
      {
        objectPermissions: [],
        fieldPermissions: [],
        permissionFlagUniversalIdentifiers: [],
      },
    ]),
  );
  const decideRoleChild = createChildDecider<FlatRoleChild>({
    coverage,
    parentMetadataName: 'role',
    parentStatusByUniversalIdentifier: parentRoleStatusByUniversalIdentifier,
    getParentUniversalIdentifier: ({ roleUniversalIdentifier }) =>
      roleUniversalIdentifier,
  });
  const childrenOf = (
    roleUniversalIdentifier: string,
  ): RoleChildren | undefined =>
    childrenByRoleUniversalIdentifier.get(roleUniversalIdentifier);
  const getUnresolvableObjectReason = ({
    metadataName,
    objectMetadataUniversalIdentifier,
  }: {
    metadataName: ChildMetadataName;
    objectMetadataUniversalIdentifier: string;
  }) =>
    getUnresolvableReferenceReason({
      metadataName,
      referenceMetadataName: 'objectMetadata',
      referenceUniversalIdentifier: objectMetadataUniversalIdentifier,
      applicationAllFlatEntityMaps,
      allFlatEntityMaps,
      resolvableReferenceUniversalIdentifiers:
        exportedObjectUniversalIdentifiers,
    });
  const getUnresolvableFieldReferenceReason = ({
    metadataName,
    fieldMetadataUniversalIdentifier,
  }: {
    metadataName: ChildMetadataName;
    fieldMetadataUniversalIdentifier: string | null;
  }) =>
    getUnresolvableReferenceReason({
      metadataName,
      referenceMetadataName: 'fieldMetadata',
      referenceUniversalIdentifier: fieldMetadataUniversalIdentifier,
      applicationAllFlatEntityMaps,
      allFlatEntityMaps,
      resolvableReferenceUniversalIdentifiers:
        resolvableFieldUniversalIdentifiers,
    });

  for (const flatObjectPermission of sortFlatEntitiesByUniversalIdentifier(
    applicationAllFlatEntityMaps.flatObjectPermissionMaps,
  )) {
    if (
      decideRoleChild({
        metadataName: 'objectPermission',
        flatEntity: flatObjectPermission,
        unsupportedReason: getUnresolvableObjectReason({
          metadataName: 'objectPermission',
          objectMetadataUniversalIdentifier:
            flatObjectPermission.objectMetadataUniversalIdentifier,
        }),
      }) === 'nested'
    ) {
      childrenOf(
        flatObjectPermission.roleUniversalIdentifier,
      )?.objectPermissions.push(
        fromFlatObjectPermissionToObjectPermissionManifest({
          flatObjectPermission,
        }),
      );
    }
  }

  for (const flatFieldPermission of sortFlatEntitiesByUniversalIdentifier(
    applicationAllFlatEntityMaps.flatFieldPermissionMaps,
  )) {
    if (
      decideRoleChild({
        metadataName: 'fieldPermission',
        flatEntity: flatFieldPermission,
        unsupportedReason:
          getUnresolvableObjectReason({
            metadataName: 'fieldPermission',
            objectMetadataUniversalIdentifier:
              flatFieldPermission.objectMetadataUniversalIdentifier,
          }) ??
          getUnresolvableFieldReferenceReason({
            metadataName: 'fieldPermission',
            fieldMetadataUniversalIdentifier:
              flatFieldPermission.fieldMetadataUniversalIdentifier,
          }),
      }) === 'nested'
    ) {
      childrenOf(
        flatFieldPermission.roleUniversalIdentifier,
      )?.fieldPermissions.push(
        fromFlatFieldPermissionToFieldPermissionManifest({
          flatFieldPermission,
        }),
      );
    }
  }

  for (const flatRolePermissionFlag of sortFlatEntitiesByUniversalIdentifier(
    applicationAllFlatEntityMaps.flatRolePermissionFlagMaps,
  )) {
    if (
      decideRoleChild({
        metadataName: 'rolePermissionFlag',
        flatEntity: flatRolePermissionFlag,
        unsupportedReason: getUnresolvableReferenceReason({
          metadataName: 'rolePermissionFlag',
          referenceMetadataName: 'permissionFlag',
          referenceUniversalIdentifier:
            flatRolePermissionFlag.permissionFlagUniversalIdentifier,
          applicationAllFlatEntityMaps,
          allFlatEntityMaps,
          resolvableReferenceUniversalIdentifiers:
            exportedPermissionFlagUniversalIdentifiers,
        }),
      }) === 'nested'
    ) {
      childrenOf(
        flatRolePermissionFlag.roleUniversalIdentifier,
      )?.permissionFlagUniversalIdentifiers.push(
        flatRolePermissionFlag.permissionFlagUniversalIdentifier,
      );
    }
  }

  const {
    predicateGroupsByRoleUniversalIdentifier,
    predicatesByRoleUniversalIdentifier,
    coverage: rowLevelPermissionCoverage,
  } = reconstructRowLevelPermissionPredicatesManifest({
    applicationAllFlatEntityMaps,
    allFlatEntityMaps,
    exportedObjectUniversalIdentifiers,
    resolvableFieldUniversalIdentifiers,
    parentRoleStatusByUniversalIdentifier,
  });

  coverage.push(...rowLevelPermissionCoverage);

  const roles = flatRoles.map((flatRole) => {
    coverage.push(
      buildExportedCoverageEntry({
        metadataName: 'role',
        flatEntity: flatRole,
      }),
    );

    const children = childrenOf(flatRole.universalIdentifier);

    return fromFlatRoleToRoleManifest({
      flatRole,
      children: {
        objectPermissions: children?.objectPermissions,
        fieldPermissions: children?.fieldPermissions,
        rowLevelPermissionPredicateGroups:
          predicateGroupsByRoleUniversalIdentifier.get(
            flatRole.universalIdentifier,
          ) ?? [],
        rowLevelPermissionPredicates:
          predicatesByRoleUniversalIdentifier.get(
            flatRole.universalIdentifier,
          ) ?? [],
        permissionFlagUniversalIdentifiers:
          children?.permissionFlagUniversalIdentifiers.sort(compareByCodePoint),
      },
    });
  });

  return { permissionFlags, roles, coverage };
};
