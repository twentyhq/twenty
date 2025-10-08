import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordGqlFields } from '@/object-record/graphql/types/RecordGqlFields';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';

export type GenerateDepthOneRecordGqlFields = {
  objectMetadataItem: ObjectMetadataItem;
};

export const generateDepthOneRecordGqlFields = ({
  objectMetadataItem,
}: GenerateDepthOneRecordGqlFields) => {
  const gqlFieldsAsArray: RecordGqlFields[] =
    objectMetadataItem.readableFields.flatMap((fieldMetadata) => {
      const isManyToOneMorphRelation =
        fieldMetadata.type === FieldMetadataType.MORPH_RELATION &&
        fieldMetadata.settings.relationType === RelationType.MANY_TO_ONE;

      const isManyToOneRelation =
        fieldMetadata.type === FieldMetadataType.RELATION &&
        fieldMetadata.settings.relationType === RelationType.MANY_TO_ONE;

      if (isManyToOneRelation) {
        return [
          { [`${fieldMetadata.name}Id`]: true },
          { [`${fieldMetadata.name}`]: { id: true, name: true } },
        ];
      }

      if (isManyToOneMorphRelation) {
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
        return morphGqlFields.flatMap((morphGqlField) => [
          { [`${morphGqlField.gqlField}`]: { id: true, name: true } },
          { [`${morphGqlField.gqlField}Id`]: true },
        ]);
      }

      return [{ [fieldMetadata.name]: true }];
    });

  return Object.assign({}, ...gqlFieldsAsArray);
};
