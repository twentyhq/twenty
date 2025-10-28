import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getTargetObjectMetadataOrThrow } from 'src/engine/api/graphql/graphql-query-runner/utils/get-target-object-metadata.util';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isFieldMetadataTypeMorphRelation } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-type-morph-relation.util';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

type GetFieldMetadataFromGraphQLFieldArgs = {
  objectMetadataItem: ObjectMetadataItemWithFieldMaps;
  graphQLField: string;
  objectMetadataMaps: ObjectMetadataMaps;
};

export function getFieldMetadataFromGraphQLField({
  objectMetadataItem,
  graphQLField,
  objectMetadataMaps,
}: GetFieldMetadataFromGraphQLFieldArgs) {
  const sourceFieldMetadataId = objectMetadataItem.fieldIdByName[graphQLField];
  let sourceFieldMetadata =
    objectMetadataItem.fieldsById[sourceFieldMetadataId];

  // If empty, it could be a morph relation
  if (!isDefined(sourceFieldMetadata)) {
    const morphRelationsWithTargetObjectMetadata = Object.values(
      objectMetadataItem.fieldsById,
    )
      .filter(
        (fieldMetadata) =>
          fieldMetadata.type === FieldMetadataType.MORPH_RELATION,
      )
      .map((fieldMetadata) => {
        const targetObjectMetadata = getTargetObjectMetadataOrThrow(
          fieldMetadata,
          objectMetadataMaps,
        );

        return {
          fieldMetadata,
          targetObjectMetadata,
        };
      });

    const possibleGraphQLFieldNames: {
      graphQLField: string;
      fieldMetadata: FieldMetadataEntity;
      targetObjectMetadata: ObjectMetadataItemWithFieldMaps;
    }[] = [];

    morphRelationsWithTargetObjectMetadata.map((morphRelation) => {
      if (
        !isFieldMetadataTypeMorphRelation(morphRelation.fieldMetadata) ||
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
