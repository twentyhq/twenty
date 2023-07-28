import {
  EntityFieldDefinition,
  EntityFieldTextMetadata,
} from '../EntityFieldMetadata';

export function isEntityFieldText(
  field: EntityFieldDefinition<unknown>,
): field is EntityFieldDefinition<EntityFieldTextMetadata> {
  return field.type === 'text';
}
