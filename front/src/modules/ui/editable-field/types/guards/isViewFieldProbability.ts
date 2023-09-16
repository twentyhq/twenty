import {
  ViewFieldDefinition,
  ViewFieldMetadata,
  ViewFieldProbabilityMetadata,
} from '../ViewField';

export const isViewFieldProbability = (
  field: ViewFieldDefinition<ViewFieldMetadata>,
): field is ViewFieldDefinition<ViewFieldProbabilityMetadata> =>
  field.metadata.type === 'probability';
