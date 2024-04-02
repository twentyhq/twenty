import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RelationDirections } from '@/object-record/record-field/types/FieldDefinition';
import {
  FieldMetadataType,
  RelationDefinitionType,
} from '~/generated-metadata/graphql';

export const getFieldRelationDirections = (
  field: Pick<FieldMetadataItem, 'type' | 'relationDefinition'> | undefined,
): RelationDirections => {
  if (!field || field.type !== FieldMetadataType.Relation) {
    throw new Error(`Field is not a relation field.`);
  }

  switch (field.relationDefinition?.direction) {
    case RelationDefinitionType.ManyToMany:
      throw new Error(`Many to many relations are not supported.`);
    case RelationDefinitionType.OneToMany:
      return {
        from: 'FROM_ONE_OBJECT',
        to: 'TO_MANY_OBJECTS',
      };
    case RelationDefinitionType.ManyToOne:
      return {
        from: 'FROM_MANY_OBJECTS',
        to: 'TO_ONE_OBJECT',
      };
    case RelationDefinitionType.OneToOne:
      return {
        from: 'FROM_ONE_OBJECT',
        to: 'TO_ONE_OBJECT',
      };
    default:
      throw new Error(
        `Invalid relation definition type direction : ${field.relationDefinition?.direction}`,
      );
  }
};
