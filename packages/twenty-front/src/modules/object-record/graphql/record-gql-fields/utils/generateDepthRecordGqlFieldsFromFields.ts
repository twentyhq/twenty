import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { type GenerateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/record-gql-fields/types/GenerateDepthRecordGqlFieldsFromFields';
import { type RecordGqlFields } from '@/object-record/graphql/record-gql-fields/types/RecordGqlFields';
import { buildIdentifierGqlFields } from '@/object-record/graphql/record-gql-fields/utils/buildIdentifierGqlFields';
import { generateJunctionRelationGqlFields } from '@/object-record/graphql/record-gql-fields/utils/generateJunctionRelationGqlFields';
import { getJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';
import { getReverseJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getReverseJunctionConfig';
import { isUsableJunctionConfig } from '@/object-record/record-field/ui/utils/junction/isUsableJunctionConfig';
import {
  computeMorphRelationGqlFieldName,
  isDefined,
} from 'twenty-shared/utils';

export const generateDepthRecordGqlFieldsFromFields = ({
  objectMetadataItems,
  sourceObjectMetadataItem,
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

        const junctionConfig = getJunctionConfig({
          settings: fieldMetadata.settings,
          relationObjectMetadataId: targetObjectMetadataItem.id,
          relationTargetFieldMetadataId:
            fieldMetadata.relation?.targetFieldMetadata.id,
          sourceObjectMetadataId:
            fieldMetadata.relation?.sourceObjectMetadata.id,
          objectMetadataItems,
        });

        if (
          isDefined(junctionConfig) &&
          !isUsableJunctionConfig(junctionConfig)
        ) {
          return recordGqlFields;
        }

        const reverseJunctionConfig = getReverseJunctionConfig({
          junctionObjectMetadataId: targetObjectMetadataItem.id,
          sourceObjectMetadataId: sourceObjectMetadataItem?.id,
          objectMetadataItems,
        });

        if (isDefined(reverseJunctionConfig) && depth === 1) {
          return {
            ...recordGqlFields,
            [fieldMetadata.name]: {
              ...buildIdentifierGqlFields(
                reverseJunctionConfig.junctionObjectMetadata,
              ),
              [reverseJunctionConfig.relationFieldName]:
                buildIdentifierGqlFields(
                  reverseJunctionConfig.relatedObjectMetadata,
                ),
            },
          };
        }

        if (isUsableJunctionConfig(junctionConfig) && depth === 1) {
          return {
            ...recordGqlFields,
            [fieldMetadata.name]: generateJunctionRelationGqlFields({
              junctionConfig,
              objectMetadataItems,
            }),
          };
        }

        const relationIdentifierSubGqlFields = buildIdentifierGqlFields(
          targetObjectMetadataItem,
        );

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
          (morphRelation) => {
            const morphTargetObjectMetadataItem = objectMetadataItems.find(
              (objectMetadataItem) =>
                objectMetadataItem.id === morphRelation.targetObjectMetadata.id,
            );

            if (!morphTargetObjectMetadataItem) {
              throw new Error(
                `Target object metadata item not found for ${fieldMetadata.name} (morph target ${morphRelation.targetObjectMetadata.nameSingular})`,
              );
            }

            return {
              gqlField: computeMorphRelationGqlFieldName({
                fieldName: fieldMetadata.name,
                relationType: morphRelation.type,
                targetObjectMetadataNameSingular:
                  morphRelation.targetObjectMetadata.nameSingular,
                targetObjectMetadataNamePlural:
                  morphRelation.targetObjectMetadata.namePlural,
              }),
              fieldMetadata,
              relationIdentifierSubGqlFields: buildIdentifierGqlFields(
                morphTargetObjectMetadataItem,
              ),
            };
          },
        );

        return {
          ...recordGqlFields,
          ...morphGqlFields.reduce(
            (morphGqlFields, morphGqlField) => ({
              ...morphGqlFields,
              ...(depth === 1 && shouldOnlyLoadRelationIdentifiers
                ? {
                    [`${morphGqlField.gqlField}`]:
                      morphGqlField.relationIdentifierSubGqlFields,
                  }
                : {}),
              ...(depth === 1 && !shouldOnlyLoadRelationIdentifiers
                ? { [`${morphGqlField.gqlField}`]: true }
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
