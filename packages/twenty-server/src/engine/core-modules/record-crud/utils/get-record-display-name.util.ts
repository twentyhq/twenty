import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// Mirrors frontend's getLabelIdentifierFieldValue logic
export const getRecordDisplayName = (
  record: Record<string, unknown>,
  flatObjectMetadata: FlatObjectMetadata,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
): string => {
  const { labelIdentifierFieldMetadataId } = flatObjectMetadata;

  if (!isDefined(labelIdentifierFieldMetadataId)) {
    return String(record.id ?? 'Unknown');
  }

  const labelIdentifierField = findFlatEntityByIdInFlatEntityMaps({
    flatEntityMaps: flatFieldMetadataMaps,
    flatEntityId: labelIdentifierFieldMetadataId,
  });

  if (!isDefined(labelIdentifierField)) {
    return String(record.id ?? 'Unknown');
  }

  const fieldValue = record[labelIdentifierField.name];

  // Handle FULL_NAME composite type (person, workspaceMember)
  if (labelIdentifierField.type === FieldMetadataType.FULL_NAME) {
    const nameValue = fieldValue as
      | { firstName?: string; lastName?: string }
      | undefined;
    const firstName = nameValue?.firstName ?? '';
    const lastName = nameValue?.lastName ?? '';

    return `${firstName} ${lastName}`.trim() || String(record.id) || 'Unknown';
  }

  return isDefined(fieldValue)
    ? String(fieldValue)
    : String(record.id ?? 'Unknown');
};
