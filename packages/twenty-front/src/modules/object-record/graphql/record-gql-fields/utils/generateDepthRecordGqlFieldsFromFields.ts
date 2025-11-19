import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getImageIdentifierFieldMetadataItem } from '@/object-metadata/utils/getImageIdentifierFieldMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { type RecordGqlFields } from '@/object-record/graphql/record-gql-fields/types/RecordGqlFields';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';

export type GenerateDepthRecordGqlFieldsFromFields = {
  objectMetadataItems: Pick<
    ObjectMetadataItem,
    'id' | 'fields' | 'labelIdentifierFieldMetadataId' | 'nameSingular'
  >[];
  fields: Pick<
    FieldMetadataItem,
    'name' | 'type' | 'settings' | 'morphRelations' | 'relation'
  >[];
  depth: 0 | 1;
  shouldOnlyLoadRelationIdentifiers?: boolean;
};

export const generateDepthRecordGqlFieldsFromFields = ({
  objectMetadataItems,
  fields,
  depth,
  shouldOnlyLoadRelationIdentifiers = true,
}: GenerateDepthRecordGqlFieldsFromFields) => {
  const generatedRecordGqlFields: RecordGqlFields = fields.reduce(
    (recordGqlFields, fieldMetadata) => {
      const isMorphRelation =
        fieldMetadata.type === FieldMetadataType.MORPH_RELATION;

      const isRelation = fieldMetadata.type === FieldMetadataType.RELATION;

      const relationType = fieldMetadata.settings?.relationType;

      if (isRelation) {
        const targetObjectMetadataItem = objectMetadataItems.find(
          (objectMetadataItem) =>
            objectMetadataItem.id ===
            fieldMetadata.relation?.targetObjectMetadata.id,
        );

        if (!targetObjectMetadataItem) {
          throw new Error(
            `Target object metadata item not found for ${fieldMetadata.name}`,
          );
        }

        const labelIdentifierFieldMetadataItem =
          getLabelIdentifierFieldMetadataItem(targetObjectMetadataItem);

        const imageIdentifierFieldMetadataItem =
          getImageIdentifierFieldMetadataItem(targetObjectMetadataItem);

        const relationIdentifierSubGqlFields = {
          id: true,
          ...(isDefined(labelIdentifierFieldMetadataItem)
            ? { [labelIdentifierFieldMetadataItem.name]: true }
            : {}),
          ...(isDefined(imageIdentifierFieldMetadataItem)
            ? { [imageIdentifierFieldMetadataItem.name]: true }
            : {}),
        };

        const manyToOneGqlFields = {
          [`${fieldMetadata.name}Id`]: true,
        };

        return {
          ...recordGqlFields,
          ...(depth === 1 && shouldOnlyLoadRelationIdentifiers
            ? { [fieldMetadata.name]: relationIdentifierSubGqlFields }
            : undefined),
          ...(depth === 1 && !shouldOnlyLoadRelationIdentifiers
            ? { [fieldMetadata.name]: true }
            : undefined),
          ...(relationType === RelationType.MANY_TO_ONE
            ? manyToOneGqlFields
            : undefined),
        };
      }

      if (isMorphRelation) {
        if (!isDefined(fieldMetadata.morphRelations)) {
          throw new Error(
            `Field ${fieldMetadata.name} is missing, please refresh the page. If the problem persists, please contact support.`,
          );
        }

        const morphGqlFields = fieldMetadata.morphRelations.map(
          (morphRelation) => ({
            gqlField: computeMorphRelationFieldName({
              fieldName: fieldMetadata.name,
              relationType: morphRelation.type,
              targetObjectMetadataNameSingular:
                morphRelation.targetObjectMetadata.nameSingular,
              targetObjectMetadataNamePlural:
                morphRelation.targetObjectMetadata.namePlural,
            }),
            fieldMetadata,
          }),
        );

        return {
          ...recordGqlFields,
          ...morphGqlFields.reduce(
            (morphGqlFields, morphGqlField) => ({
              ...morphGqlFields,
              ...(depth === 1
                ? { [`${morphGqlField.gqlField}`]: { id: true, name: true } }
                : {}),
              ...(relationType === RelationType.MANY_TO_ONE
                ? { [`${morphGqlField.gqlField}Id`]: true }
                : {}),
            }),
            {},
          ),
        };
      }

      return {
        ...recordGqlFields,
        [`${fieldMetadata.name}`]: true,
      };
    },
    {},
  );

  return generatedRecordGqlFields;
};
