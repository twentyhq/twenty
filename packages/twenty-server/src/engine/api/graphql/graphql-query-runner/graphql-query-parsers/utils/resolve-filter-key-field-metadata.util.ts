import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type LiteFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/lite-flat-field-metadata.type';

export const resolveFilterKeyFieldMetadata = <
  T extends LiteFlatFieldMetadata = FlatFieldMetadata,
>({
  filterKey,
  fieldIdByName,
  fieldIdByJoinColumnName,
  flatFieldMetadataMaps,
}: {
  filterKey: string;
  fieldIdByName: Record<string, string>;
  fieldIdByJoinColumnName: Record<string, string>;
  flatFieldMetadataMaps: FlatEntityMaps<T>;
}): {
  fieldMetadata: T | undefined;
  isReferencedByFieldName: boolean;
} => {
  const isReferencedByFieldName = isDefined(fieldIdByName[filterKey]);

  const fieldMetadataId =
    fieldIdByName[filterKey] ?? fieldIdByJoinColumnName[filterKey];

  const fieldMetadata = isDefined(fieldMetadataId)
    ? findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      })
    : undefined;

  return { fieldMetadata, isReferencedByFieldName };
};
