import {
  EntityFieldDefinition,
  EntityFieldRelationMetadata,
} from '../EntityFieldMetadata';

export function isEntityFieldRelation(
  field: EntityFieldDefinition<unknown>,
): field is EntityFieldDefinition<EntityFieldRelationMetadata> {
  return field.type === 'relation';
}
