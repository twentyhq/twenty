import {
  ViewFieldDefinition,
  ViewFieldMetadata,
  ViewFieldProbabilityMetadata,
} from '../ViewField';

export function isViewFieldProbability(
  field: ViewFieldDefinition<ViewFieldMetadata>,
): field is ViewFieldDefinition<ViewFieldProbabilityMetadata> {
  return field.metadata.type === 'probability';
}
