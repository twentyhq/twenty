import { ViewFieldDefinition, ViewFieldTextMetadata } from '../ViewField';

export function isViewFieldText(
  field: ViewFieldDefinition<unknown>,
): field is ViewFieldDefinition<ViewFieldTextMetadata> {
  return field.type === 'text';
}
