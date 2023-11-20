import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldProbabilityMetadata } from '../FieldMetadata';

export const isFieldProbability = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldProbabilityMetadata> =>
  field.type === 'PROBABILITY';
