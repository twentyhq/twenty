import { isDefined } from 'twenty-shared/utils';

import { isFieldUpdatableByAutomation } from 'src/engine/core-modules/record-crud/utils/is-field-updatable-by-automation.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const getFieldMetadataIdsNotUpdatableByAutomation = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadata: Pick<FlatObjectMetadata, 'nameSingular' | 'fieldIds'>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): string[] =>
  flatObjectMetadata.fieldIds.filter((fieldMetadataId) => {
    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    return (
      !isDefined(flatFieldMetadata) ||
      !isFieldUpdatableByAutomation({ flatObjectMetadata, flatFieldMetadata })
    );
  });
