import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { extractJunctionTargetSettingsFromSettings } from 'src/engine/metadata-modules/flat-field-metadata/utils/extract-junction-target-settings-from-settings.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';

// A single hop through a plain many-to-one relation joins at most one target row per source row, so aggregates keep per-source-record semantics
export const isAggregatableThroughRelationFlatFieldMetadata = <
  TFlatFieldMetadata extends OrmFlatFieldMetadata,
>(
  flatFieldMetadata: TFlatFieldMetadata,
): flatFieldMetadata is TFlatFieldMetadata &
  FlatFieldMetadata<FieldMetadataType.RELATION> =>
  isFlatFieldMetadataOfType(flatFieldMetadata, FieldMetadataType.RELATION) &&
  flatFieldMetadata.settings?.relationType === RelationType.MANY_TO_ONE &&
  !isDefined(
    extractJunctionTargetSettingsFromSettings(flatFieldMetadata.settings)
      .junctionTargetFieldId,
  ) &&
  isDefined(flatFieldMetadata.relationTargetObjectMetadataId);
