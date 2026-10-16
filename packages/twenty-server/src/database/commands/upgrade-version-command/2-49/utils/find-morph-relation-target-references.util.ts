import { FieldMetadataType } from 'twenty-shared/types';
import {
  isDefined,
  isMorphRelationHead,
  pickMorphGroupSurvivorOrThrow,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatFieldPermission } from 'src/engine/metadata-modules/flat-field-permission/types/flat-field-permission.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';
import { resolveEffectiveFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity.util';

export type MorphRelationTargetReferences = {
  viewFields: FlatViewField[];
  viewFilters: FlatViewFilter[];
  fieldPermissions: FlatFieldPermission[];
};

// 2.48 copied only the representative's permissions onto the head; the other targets' rows still restrict their column
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
  const targetsByMorphId = new Map<
    string,
    FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>[]
  >();

  for (const field of Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  )) {
    if (
      isDefined(field) &&
      isFlatFieldMetadataOfType(field, FieldMetadataType.MORPH_RELATION) &&
      !isMorphRelationHead(field) &&
      isDefined(flatFieldMetadataMaps.byUniversalIdentifier[field.morphId])
    ) {
      targetsByMorphId.set(field.morphId, [
        ...(targetsByMorphId.get(field.morphId) ?? []),
        field,
      ]);
    }
  }

  const targetIds = new Set(
    [...targetsByMorphId.values()].flat().map(({ id }) => id),
  );
  const representativeTargetIds = new Set(
    [...targetsByMorphId.values()].map(
      (targets) =>
        pickMorphGroupSurvivorOrThrow(
          targets.map((target) =>
            resolveEffectiveFlatEntity({
              metadataName: 'fieldMetadata',
              flatEntity: target,
            }),
          ),
        ).id,
    ),
  );
  const isTarget = (fieldMetadataId: string | null | undefined) =>
    isDefined(fieldMetadataId) && targetIds.has(fieldMetadataId);

  return {
    viewFields: Object.values(flatViewFieldMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter((viewField) => isTarget(viewField.fieldMetadataId)),
    viewFilters: Object.values(flatViewFilterMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        (viewFilter) =>
          isTarget(viewFilter.fieldMetadataId) ||
          isTarget(viewFilter.relationTargetFieldMetadataId),
      ),
    fieldPermissions: Object.values(
      flatFieldPermissionMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((fieldPermission) =>
        representativeTargetIds.has(fieldPermission.fieldMetadataId),
      ),
  };
};
