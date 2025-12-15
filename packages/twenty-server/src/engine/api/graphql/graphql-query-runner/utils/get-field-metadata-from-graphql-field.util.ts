import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getTargetObjectMetadataOrThrow } from 'src/engine/api/graphql/graphql-query-runner/utils/get-target-object-metadata.util';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type GetFieldMetadataFromGraphQLFieldArgs = {
  flatObjectMetadata: FlatObjectMetadata;
  graphQLField: string;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
};

export function getFieldMetadataFromGraphQLField({
  flatObjectMetadata,
  graphQLField,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: GetFieldMetadataFromGraphQLFieldArgs): FlatFieldMetadata | undefined {
  const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
    flatFieldMetadataMaps,
    flatObjectMetadata,
  );

  const sourceFieldMetadataId = fieldIdByName[graphQLField];
  let sourceFieldMetadata = sourceFieldMetadataId
    ? flatFieldMetadataMaps.byId[sourceFieldMetadataId]
    : undefined;

  // If empty, it could be a morph relation
  if (!isDefined(sourceFieldMetadata)) {
    const morphRelationsWithTargetObjectMetadata =
      getFlatFieldsFromFlatObjectMetadata(
        flatObjectMetadata,
        flatFieldMetadataMaps,
      )
        .filter(
          (fieldMetadata) =>
            fieldMetadata.type === FieldMetadataType.MORPH_RELATION,
        )
        .map((fieldMetadata) => {
          const targetObjectMetadata = getTargetObjectMetadataOrThrow(
            fieldMetadata,
            flatObjectMetadataMaps,
          );

          return {
            fieldMetadata,
            targetObjectMetadata,
          };
        });

    const possibleGraphQLFieldNames: {
      graphQLField: string;
      fieldMetadata: FlatFieldMetadata;
      targetObjectMetadata: FlatObjectMetadata;
    }[] = [];

    morphRelationsWithTargetObjectMetadata.map((morphRelation) => {
      if (
        !isFlatFieldMetadataOfType(
          morphRelation.fieldMetadata,
          FieldMetadataType.MORPH_RELATION,
        ) ||
        !morphRelation.fieldMetadata.settings?.relationType
      ) {
        return;
      }

      possibleGraphQLFieldNames.push({
        graphQLField: morphRelation.fieldMetadata.name,
        fieldMetadata: morphRelation.fieldMetadata,
        targetObjectMetadata: morphRelation.targetObjectMetadata,
      });
    });

    const fieldMetdata = possibleGraphQLFieldNames.find(
      (possibleGraphQLFieldName) =>
        possibleGraphQLFieldName.graphQLField === graphQLField,
    )?.fieldMetadata;

    if (fieldMetdata) {
      sourceFieldMetadata = fieldMetdata;
    }
  }

  return sourceFieldMetadata;
}
