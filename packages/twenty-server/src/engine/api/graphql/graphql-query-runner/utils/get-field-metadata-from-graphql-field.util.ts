import { FieldMetadataType } from 'twenty-shared/types';

import { getTargetObjectMetadataOrThrow } from 'src/engine/api/graphql/graphql-query-runner/utils/get-target-object-metadata.util';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { computeMorphRelationFieldName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-relation-field-name.util';
import { isFieldMetadataTypeMorphRelation } from 'src/engine/metadata-modules/field-metadata/utils/is-field-metadata-type-morph-relation.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export function getFieldMetadataFromGraphQLField({
  objectMetadataItem,
  graphQLField,
  objectMetadataMaps,
}: {
  objectMetadataItem: ObjectMetadataItemWithFieldMaps;
  graphQLField: string;
  objectMetadataMaps: ObjectMetadataMaps;
}) {
  const sourceFieldMetadataId = objectMetadataItem.fieldIdByName[graphQLField];
  let sourceFieldMetadata =
    objectMetadataItem.fieldsById[sourceFieldMetadataId];

  // If empty, it could be a morph relation
  if (!sourceFieldMetadata) {
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

      const name = computeMorphRelationFieldName({
        fieldName: morphRelation.fieldMetadata.name,
        relationDirection: morphRelation.fieldMetadata.settings.relationType,
        targetObjectMetadata: morphRelation.targetObjectMetadata,
      });

      possibleGraphQLFieldNames.push({
        graphQLField: name,
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
