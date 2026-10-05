import { RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const computeMaxFieldCountPerRecord = ({
  select,
  flatObjectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  recordLimitPerOneToManyRelation,
}: {
  select: CommonSelectedFields;
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  recordLimitPerOneToManyRelation: number;
}): number => {
  const selectedRelationFields = getFlatFieldsFromFlatObjectMetadata(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  )
    .filter(isMorphOrRelationFlatFieldMetadata)
    .filter((relationField) => isDefined(select[relationField.name]));

  const selectedColumnCount =
    Object.keys(select).length - selectedRelationFields.length;

  const maxFieldCount = selectedRelationFields.reduce(
    (fieldCount, relationField) =>
      fieldCount +
      (relationField.settings.relationType === RelationType.ONE_TO_MANY
        ? recordLimitPerOneToManyRelation
        : 1) *
        computeMaxFieldCountPerRecord({
          select: select[relationField.name] as CommonSelectedFields,
          flatObjectMetadata: findFlatEntityByIdInFlatEntityMapsOrThrow({
            flatEntityId: relationField.relationTargetObjectMetadataId,
            flatEntityMaps: flatObjectMetadataMaps,
          }),
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
          recordLimitPerOneToManyRelation,
        }),
    selectedColumnCount,
  );

  return maxFieldCount || 1;
};
