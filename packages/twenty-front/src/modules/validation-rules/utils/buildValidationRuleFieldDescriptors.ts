import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  FieldMetadataType,
  RelationType as SharedRelationType,
  type ValidationRuleFieldDescriptor,
} from 'twenty-shared/types';
import {
  isDefined,
  toDatabaseEventValidationRuleField,
} from 'twenty-shared/utils';

import { type ValidationRuleScope } from '@/validation-rules/types/ValidationRuleScope';
import { RelationType } from '~/generated-metadata/graphql';

const toScalarFieldDescriptor = (
  fieldMetadataItem: FieldMetadataItem,
): ValidationRuleFieldDescriptor => ({
  name: fieldMetadataItem.name,
  type: fieldMetadataItem.type,
  universalIdentifier:
    fieldMetadataItem.universalIdentifier ?? fieldMetadataItem.id,
});

const buildDatabaseEventFieldDescriptors = (
  objectMetadataItem: Pick<EnrichedObjectMetadataItem, 'fields'>,
): ValidationRuleFieldDescriptor[] =>
  objectMetadataItem.fields
    .filter((fieldMetadataItem) => fieldMetadataItem.isActive)
    .map((fieldMetadataItem) =>
      toDatabaseEventValidationRuleField({
        ...toScalarFieldDescriptor(fieldMetadataItem),
        relationType:
          fieldMetadataItem.relation?.type === RelationType.MANY_TO_ONE
            ? SharedRelationType.MANY_TO_ONE
            : SharedRelationType.ONE_TO_MANY,
      }),
    )
    .filter(isDefined);

export const buildValidationRuleFieldDescriptors = ({
  objectMetadataItem,
  objectMetadataItems,
  scope = 'record',
}: {
  objectMetadataItem: Pick<EnrichedObjectMetadataItem, 'fields'>;
  objectMetadataItems: Pick<EnrichedObjectMetadataItem, 'id' | 'fields'>[];
  scope?: ValidationRuleScope;
}): ValidationRuleFieldDescriptor[] =>
  scope === 'databaseEvent'
    ? buildDatabaseEventFieldDescriptors(objectMetadataItem)
    : objectMetadataItem.fields
        .filter((fieldMetadataItem) => fieldMetadataItem.isActive)
        .map((fieldMetadataItem) => {
          const relation = fieldMetadataItem.relation;

          if (
            fieldMetadataItem.type !== FieldMetadataType.RELATION ||
            !isDefined(relation)
          ) {
            return toScalarFieldDescriptor(fieldMetadataItem);
          }

          const isManyToOne = relation.type === RelationType.MANY_TO_ONE;

          const targetObjectMetadataItem = objectMetadataItems.find(
            (candidate) => candidate.id === relation.targetObjectMetadata.id,
          );

          return {
            ...toScalarFieldDescriptor(fieldMetadataItem),
            relationType: isManyToOne
              ? SharedRelationType.MANY_TO_ONE
              : SharedRelationType.ONE_TO_MANY,
            relationTargetFields:
              isManyToOne && isDefined(targetObjectMetadataItem)
                ? targetObjectMetadataItem.fields
                    .filter((targetField) => targetField.isActive)
                    .map(toScalarFieldDescriptor)
                : undefined,
          };
        });
