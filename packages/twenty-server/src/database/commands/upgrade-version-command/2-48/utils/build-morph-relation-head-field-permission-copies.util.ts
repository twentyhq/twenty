import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatFieldPermission } from 'src/engine/metadata-modules/flat-field-permission/types/flat-field-permission.type';

export const buildMorphRelationHeadFieldPermissionCopies = ({
  headByRepresentativeId,
  flatFieldPermissionMaps,
}: {
  headByRepresentativeId: Map<string, FlatFieldMetadata>;
  flatFieldPermissionMaps: FlatEntityMaps<FlatFieldPermission>;
}): FlatFieldPermission[] => {
  const fieldPermissions = Object.values(
    flatFieldPermissionMaps.byUniversalIdentifier,
  ).filter(isDefined);
  const fieldPermissionKeys = new Set(
    fieldPermissions.map(
      (fieldPermission) =>
        `${fieldPermission.roleId}:${fieldPermission.fieldMetadataId}`,
    ),
  );

  return fieldPermissions.flatMap((fieldPermission) => {
    const head = headByRepresentativeId.get(fieldPermission.fieldMetadataId);
    const headKey = `${fieldPermission.roleId}:${head?.id}`;

    if (!isDefined(head) || fieldPermissionKeys.has(headKey)) {
      return [];
    }

    fieldPermissionKeys.add(headKey);

    return [
      {
        ...fieldPermission,
        id: v4(),
        universalIdentifier: v4(),
        fieldMetadataId: head.id,
        fieldMetadataUniversalIdentifier: head.universalIdentifier,
      },
    ];
  });
};
