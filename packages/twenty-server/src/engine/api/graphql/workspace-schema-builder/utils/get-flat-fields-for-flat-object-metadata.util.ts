import { isMorphRelationGroup } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const getFlatFieldsFromFlatObjectMetadata = <
  TFieldMetadata extends Pick<
    OrmFlatFieldMetadata,
    | 'id'
    | 'universalIdentifier'
    | 'applicationId'
    | 'workspaceId'
    | 'type'
    | 'morphId'
  > = FlatFieldMetadata,
>(
  flatObjectMetadata: Pick<FlatObjectMetadata, 'fieldIds'>,
  flatFieldMetadataMaps: FlatEntityMaps<TFieldMetadata>,
): TFieldMetadata[] => {
  return findManyFlatEntityByIdInFlatEntityMaps({
    flatEntityIds: flatObjectMetadata.fieldIds,
    flatEntityMaps: flatFieldMetadataMaps,
  }).filter((fieldMetadata) => !isMorphRelationGroup(fieldMetadata));
};
