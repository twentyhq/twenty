import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isMorphRelationHead } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatFieldPermission } from 'src/engine/metadata-modules/flat-field-permission/types/flat-field-permission.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';

export type MorphRelationTargetReferences = {
  viewFields: FlatViewField[];
  viewFilters: FlatViewFilter[];
  fieldPermissions: FlatFieldPermission[];
};

export const findMorphRelationTargetReferences = ({
  flatFieldMetadataMaps,
  flatViewFieldMaps,
  flatViewFilterMaps,
  flatFieldPermissionMaps,
}: {
  flatFieldMetadataMaps: Pick<
    FlatEntityMaps<FlatFieldMetadata>,
    'byUniversalIdentifier'
  >;
  flatViewFieldMaps: Pick<FlatEntityMaps<FlatViewField>, 'byUniversalIdentifier'>;
  flatViewFilterMaps: Pick<FlatEntityMaps<FlatViewFilter>, 'byUniversalIdentifier'>;
  flatFieldPermissionMaps: Pick<
    FlatEntityMaps<FlatFieldPermission>,
    'byUniversalIdentifier'
  >;
}): MorphRelationTargetReferences => {
  const targetIdsWithHead = new Set(
    Object.values(flatFieldMetadataMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        (field) =>
          isFlatFieldMetadataOfType(field, FieldMetadataType.MORPH_RELATION) &&
          !isMorphRelationHead(field) &&
          isDefined(flatFieldMetadataMaps.byUniversalIdentifier[field.morphId]),
      )
      .map(({ id }) => id),
  );
  const isTargetWithHead = (fieldMetadataId: string | null | undefined) =>
    isDefined(fieldMetadataId) && targetIdsWithHead.has(fieldMetadataId);

  return {
    viewFields: Object.values(flatViewFieldMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter((viewField) => isTargetWithHead(viewField.fieldMetadataId)),
    viewFilters: Object.values(flatViewFilterMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        (viewFilter) =>
          isTargetWithHead(viewFilter.fieldMetadataId) ||
          isTargetWithHead(viewFilter.relationTargetFieldMetadataId),
      ),
    fieldPermissions: Object.values(
      flatFieldPermissionMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((fieldPermission) =>
        isTargetWithHead(fieldPermission.fieldMetadataId),
      ),
  };
};
