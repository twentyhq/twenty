import { FieldMetadataType } from '~/generated/graphql';

import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldPipelineStepMetadata } from '../FieldMetadata';

export const isFieldPipelineStep = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldPipelineStepMetadata> =>
  field.type === FieldMetadataType.PipelineStep;
