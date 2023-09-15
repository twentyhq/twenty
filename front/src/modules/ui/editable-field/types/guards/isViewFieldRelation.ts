import {
  ViewFieldDefinition,
  ViewFieldMetadata,
  ViewFieldRelationMetadata,
} from '../ViewField';

export const isViewFieldRelation = (
  field: ViewFieldDefinition<ViewFieldMetadata>,
): field is ViewFieldDefinition<ViewFieldRelationMetadata> =>
  field.metadata.type === 'relation';
