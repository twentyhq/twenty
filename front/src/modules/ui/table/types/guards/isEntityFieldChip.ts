import {
  EntityFieldChipMetadata,
  EntityFieldDefinition,
} from '../EntityFieldMetadata';

export function isEntityFieldChip(
  field: EntityFieldDefinition<unknown>,
): field is EntityFieldDefinition<EntityFieldChipMetadata> {
  return field.type === 'chip';
}
