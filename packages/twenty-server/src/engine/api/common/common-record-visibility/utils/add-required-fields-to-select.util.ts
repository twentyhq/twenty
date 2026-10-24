import { isDefined } from 'twenty-shared/utils';

import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const addRequiredFieldsToSelect = ({
  select,
  flatObjectMetadata,
  resolveRequiredFieldNames,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  select: CommonSelectedFields;
  flatObjectMetadata: FlatObjectMetadata;
  resolveRequiredFieldNames: (
    flatObjectMetadata: FlatObjectMetadata,
  ) => string[];
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): CommonSelectedFields => {
  const extendedSelect: CommonSelectedFields = { ...select };

  for (const fieldName of resolveRequiredFieldNames(flatObjectMetadata)) {
    extendedSelect[fieldName] = true;
  }

  for (const fieldId of flatObjectMetadata.fieldIds) {
    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(flatFieldMetadata?.relationTargetObjectMetadataId)) {
      continue;
    }

    const relationSelect = select[flatFieldMetadata.name];

    if (typeof relationSelect !== 'object') {
      continue;
    }

    const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatFieldMetadata.relationTargetObjectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    extendedSelect[flatFieldMetadata.name] = addRequiredFieldsToSelect({
      select: relationSelect,
      flatObjectMetadata: targetFlatObjectMetadata,
      resolveRequiredFieldNames,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });
  }

  return extendedSelect;
};
