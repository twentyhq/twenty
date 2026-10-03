import { type RestrictedFieldsPermissions } from 'twenty-shared/types';

import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const getReadableFlatFields = <TFlatField extends SyncableFlatEntity>({
  flatObjectMetadata,
  flatFieldMetadataMaps,
  restrictedFields,
}: {
  flatObjectMetadata: Pick<FlatObjectMetadata, 'fieldIds'>;
  flatFieldMetadataMaps: FlatEntityMaps<TFlatField>;
  restrictedFields: RestrictedFieldsPermissions;
}): TFlatField[] =>
  flatObjectMetadata.fieldIds
    .map((fieldId) =>
      findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityMaps: flatFieldMetadataMaps,
        flatEntityId: fieldId,
      }),
    )
    .filter((flatField) => restrictedFields[flatField.id]?.canRead !== false);
