import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldProbabilityMetadata } from '../FieldMetadata';

export function isFieldProbability(
  field: FieldDefinition<FieldMetadata>,
): field is FieldDefinition<FieldProbabilityMetadata> {
  return field.type === 'probability';
}
