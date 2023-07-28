import { ViewFieldDefinition, ViewFieldRelationMetadata } from '../ViewField';

export function isViewFieldRelation(
  field: ViewFieldDefinition<unknown>,
): field is ViewFieldDefinition<ViewFieldRelationMetadata> {
  return field.type === 'relation';
}
