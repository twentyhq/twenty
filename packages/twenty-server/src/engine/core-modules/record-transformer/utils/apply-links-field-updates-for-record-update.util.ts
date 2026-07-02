import { FieldMetadataType, type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { processLinksFieldUpdate } from 'src/engine/core-modules/record-transformer/utils/process-links-field-update.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const applyLinksFieldUpdatesForRecordUpdate = ({
  processedUpdateData,
  existingRecord,
  linksFieldNames,
}: {
  processedUpdateData: Partial<ObjectRecord>;
  existingRecord: ObjectRecord;
  linksFieldNames: string[];
}): Partial<ObjectRecord> => {
  const recordUpdateData = { ...processedUpdateData };

  for (const fieldName of linksFieldNames) {
    recordUpdateData[fieldName] = processLinksFieldUpdate(
      processedUpdateData[fieldName],
      existingRecord[fieldName],
    );
  }

  return recordUpdateData;
};

export const getLinksFieldNamesFromUpdateData = ({
  updateData,
  fieldIdByName,
  flatFieldMetadataMaps,
}: {
  updateData: Partial<ObjectRecord>;
  fieldIdByName: Record<string, string>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): string[] => {
  return Object.keys(updateData).filter((fieldName) => {
    const fieldMetadataId = fieldIdByName[fieldName];

    if (!isDefined(fieldMetadataId)) {
      return false;
    }

    const fieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    return fieldMetadata?.type === FieldMetadataType.LINKS;
  });
};
