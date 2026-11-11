import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  FieldMetadataType,
  RelationType as SharedRelationType,
  type ValidationRuleFieldDescriptor,
} from 'twenty-shared/types';

import { getValidationRuleToOneRelationTargets } from '@/validation-rules/utils/getValidationRuleToOneRelationTargets';

const toScalarFieldDescriptor = (
  fieldMetadataItem: FieldMetadataItem,
): ValidationRuleFieldDescriptor => ({
  name: fieldMetadataItem.name,
  type: fieldMetadataItem.type,
  universalIdentifier:
    fieldMetadataItem.universalIdentifier ?? fieldMetadataItem.id,
});

export const buildValidationRuleFieldDescriptors = ({
  objectMetadataItem,
  objectMetadataItems,
}: {
  objectMetadataItem: Pick<EnrichedObjectMetadataItem, 'fields'>;
  objectMetadataItems: Pick<EnrichedObjectMetadataItem, 'id' | 'fields'>[];
}): ValidationRuleFieldDescriptor[] =>
  objectMetadataItem.fields
    .filter((fieldMetadataItem) => fieldMetadataItem.isActive)
    .flatMap((fieldMetadataItem) => {
      if (
        fieldMetadataItem.type !== FieldMetadataType.RELATION &&
        fieldMetadataItem.type !== FieldMetadataType.MORPH_RELATION
      ) {
        return [toScalarFieldDescriptor(fieldMetadataItem)];
      }

      const relationTargets =
        getValidationRuleToOneRelationTargets(fieldMetadataItem);

      // A relation to many records can still be named, to reject it with a clear error
      if (relationTargets.length === 0) {
        return [
          {
            ...toScalarFieldDescriptor(fieldMetadataItem),
            relationType: SharedRelationType.ONE_TO_MANY,
          },
        ];
      }

      return relationTargets.map(({ name, targetObjectMetadataId }) => ({
        ...toScalarFieldDescriptor(fieldMetadataItem),
        name,
        relationType: SharedRelationType.MANY_TO_ONE,
        relationTargetFields: objectMetadataItems
          .find((candidate) => candidate.id === targetObjectMetadataId)
          ?.fields.filter((targetField) => targetField.isActive)
          .map(toScalarFieldDescriptor),
      }));
    });
