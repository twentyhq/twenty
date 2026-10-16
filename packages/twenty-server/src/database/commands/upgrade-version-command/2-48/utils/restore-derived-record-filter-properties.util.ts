import { isNonEmptyString } from '@sniptt/guards';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/search-field-metadata/constants/search-vector-field.constants';

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
    sourceFieldMetadata.name === SEARCH_VECTOR_FIELD.name
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
