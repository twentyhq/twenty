import { ViewFieldDefinition, ViewFieldDoubleTextMetadata } from '../ViewField';

export function isViewFieldDoubleText(
  field: ViewFieldDefinition<unknown>,
): field is ViewFieldDefinition<ViewFieldDoubleTextMetadata> {
  return field.type === 'double-text' || field.type === 'double-text-chip';
}
