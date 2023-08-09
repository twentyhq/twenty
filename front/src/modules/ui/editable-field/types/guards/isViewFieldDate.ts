import {
  ViewFieldDateMetadata,
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '../ViewField';

export function isViewFieldDate(
  field: ViewFieldDefinition<ViewFieldMetadata>,
): field is ViewFieldDefinition<ViewFieldDateMetadata> {
  return field.metadata.type === 'date';
}
