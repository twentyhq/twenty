import { isNonEmptyString } from '@sniptt/guards';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const SEARCH_VECTOR_FIELD_NAME = 'searchVector';

// Rebuilds the type, label and display value that record filters carried
// before 2.48, so the previous release can still read them after a rollback
export const restoreDerivedRecordFilterProperties = ({
  recordFilter,
  flatFieldMetadataMaps,
}: {
  recordFilter: Record<string, unknown>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): Record<string, unknown> => {
  const { fieldMetadataId, relationTargetFieldMetadataId, value } =
    recordFilter;

  const sourceFieldMetadata = isNonEmptyString(fieldMetadataId)
    ? findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      })
    : undefined;

  if (!isDefined(sourceFieldMetadata)) {
    return recordFilter;
  }

  const relationTargetFieldMetadata = isNonEmptyString(
    relationTargetFieldMetadataId,
  )
    ? findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: relationTargetFieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      })
    : undefined;

  const label =
    sourceFieldMetadata.name === SEARCH_VECTOR_FIELD_NAME
      ? 'Search'
      : isDefined(relationTargetFieldMetadata)
        ? `${sourceFieldMetadata.label} → ${relationTargetFieldMetadata.label}`
        : sourceFieldMetadata.label;

  return {
    ...recordFilter,
    type: getFilterTypeFromFieldType(
      (relationTargetFieldMetadata ?? sourceFieldMetadata).type,
    ),
    label,
    displayValue: value,
  };
};
