import { isDefined } from 'twenty-shared/utils';

import { type ExplicitObjectGrants } from 'src/engine/core-modules/tool-provider/interfaces/explicit-object-grants.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatObjectPermission } from 'src/engine/metadata-modules/flat-object-permission/types/flat-object-permission.type';

export type ExplicitObjectPermission = Pick<
  FlatObjectPermission,
  | 'canReadObjectRecords'
  | 'canUpdateObjectRecords'
  | 'canSoftDeleteObjectRecords'
  | 'canDestroyObjectRecords'
>;

export const buildExplicitObjectPermissionByObjectId = ({
  explicitObjectGrants,
  flatObjectPermissionMaps,
  flatObjectMetadataMaps,
}: {
  explicitObjectGrants: ExplicitObjectGrants;
  flatObjectPermissionMaps: Pick<
    FlatEntityMaps<FlatObjectPermission>,
    'byUniversalIdentifier'
  >;
  flatObjectMetadataMaps: Pick<
    FlatEntityMaps<FlatObjectMetadata>,
    'byUniversalIdentifier'
  >;
}): Map<string, ExplicitObjectPermission> => {
  if (explicitObjectGrants.type === 'role') {
    return new Map(
      Object.values(flatObjectPermissionMaps.byUniversalIdentifier)
        .filter(isDefined)
        .filter(
          (flatObjectPermission) =>
            flatObjectPermission.roleId === explicitObjectGrants.roleId,
        )
        .map((flatObjectPermission) => [
          flatObjectPermission.objectMetadataId,
          flatObjectPermission,
        ]),
    );
  }

  const { scope } = explicitObjectGrants;

  return new Map(
    Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
      .filter(isDefined)
      .flatMap((flatObjectMetadata) => {
        const objectPermission = scope.objectPermissions?.find(
          ({ objectUniversalIdentifier }) =>
            objectUniversalIdentifier ===
            flatObjectMetadata.universalIdentifier,
        );
        const explicitObjectPermission: ExplicitObjectPermission = {
          canReadObjectRecords:
            scope.canReadAllObjectRecords === true ||
            objectPermission?.canReadObjectRecords === true,
          canUpdateObjectRecords:
            scope.canUpdateAllObjectRecords === true ||
            objectPermission?.canUpdateObjectRecords === true,
          canSoftDeleteObjectRecords:
            scope.canSoftDeleteAllObjectRecords === true ||
            objectPermission?.canSoftDeleteObjectRecords === true,
          canDestroyObjectRecords:
            scope.canDestroyAllObjectRecords === true ||
            objectPermission?.canDestroyObjectRecords === true,
        };

        return Object.values(explicitObjectPermission).some(
          (isGranted) => isGranted === true,
        )
          ? [[flatObjectMetadata.id, explicitObjectPermission] as const]
          : [];
      }),
  );
};
