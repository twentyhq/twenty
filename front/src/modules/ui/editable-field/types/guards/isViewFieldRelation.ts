import {
  ViewFieldDefinition,
  ViewFieldMetadata,
  ViewFieldRelationMetadata,
} from '../ViewField';

export function isViewFieldRelation(
  field: ViewFieldDefinition<ViewFieldMetadata>,
): field is ViewFieldDefinition<ViewFieldRelationMetadata> {
  return field.metadata.type === 'relation';
}
