import { FieldMetadataType } from '~/generated/graphql';

import { FieldDefinition } from '../FieldDefinition';
import { FieldMetadata, FieldPipelineStepsMetadata } from '../FieldMetadata';

export const isFieldPipelineSteps = (
  field: Pick<FieldDefinition<FieldMetadata>, 'type'>,
): field is FieldDefinition<FieldPipelineStepsMetadata> =>
  field.type === FieldMetadataType.PipelineSteps;
