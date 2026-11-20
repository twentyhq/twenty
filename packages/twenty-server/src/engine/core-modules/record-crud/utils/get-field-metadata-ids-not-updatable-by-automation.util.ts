import { isDefined } from 'twenty-shared/utils';
import { isObjectSyncedFromConnectedAccounts } from 'twenty-shared/workflow';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';

// Mirrors canFieldsBeUpdatedByAutomation for an object automation may update.
export const getFieldMetadataIdsNotUpdatableByAutomation = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadata: Pick<FlatObjectMetadata, 'nameSingular' | 'fieldIds'>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): string[] => {
  if (
    !isObjectSyncedFromConnectedAccounts({
      nameSingular: flatObjectMetadata.nameSingular,
    })
  ) {
    return [];
  }

  return flatObjectMetadata.fieldIds.filter((fieldMetadataId) => {
    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    return (
      !isDefined(flatFieldMetadata) ||
      belongsToTwentyStandardApp(flatFieldMetadata)
    );
  });
};
