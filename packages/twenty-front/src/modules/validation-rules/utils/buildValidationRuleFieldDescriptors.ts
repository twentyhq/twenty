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

import { getRelationIdFieldNames } from '@/object-metadata/utils/getRelationIdFieldNames';
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

const buildMorphTargetIdFieldDescriptors = (
  fieldMetadataItem: FieldMetadataItem,
): ValidationRuleFieldDescriptor[] =>
  (fieldMetadataItem.morphRelations ?? []).some(
    (morphRelation) => morphRelation.type === RelationType.MANY_TO_ONE,
  )
    ? getRelationIdFieldNames(fieldMetadataItem).map((name) => ({
        ...toScalarFieldDescriptor(fieldMetadataItem),
        name,
        type: FieldMetadataType.UUID,
      }))
    : [];

const buildDatabaseEventFieldDescriptors = (
  objectMetadataItem: Pick<EnrichedObjectMetadataItem, 'fields'>,
): ValidationRuleFieldDescriptor[] =>
  objectMetadataItem.fields
    .filter((fieldMetadataItem) => fieldMetadataItem.isActive)
    .flatMap((fieldMetadataItem) => {
      if (fieldMetadataItem.type === FieldMetadataType.MORPH_RELATION) {
        return buildMorphTargetIdFieldDescriptors(fieldMetadataItem);
      }

      const descriptor = toDatabaseEventValidationRuleField({
        ...toScalarFieldDescriptor(fieldMetadataItem),
        relationType:
          fieldMetadataItem.relation?.type === RelationType.MANY_TO_ONE
            ? SharedRelationType.MANY_TO_ONE
            : SharedRelationType.ONE_TO_MANY,
      });

      return isDefined(descriptor) ? [descriptor] : [];
    });

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
