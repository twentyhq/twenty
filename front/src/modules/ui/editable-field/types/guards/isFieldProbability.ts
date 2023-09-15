import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldProbabilityMetadata } from '../FieldMetadata';

export const isFieldProbability = (
  field: FieldDefinition<FieldMetadata>,
): field is FieldDefinition<FieldProbabilityMetadata> =>
  field.type === 'probability';
