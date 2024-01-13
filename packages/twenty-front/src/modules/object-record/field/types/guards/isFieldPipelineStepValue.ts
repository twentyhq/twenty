import { FieldPipelineStepValue } from '@/object-record/field/types/FieldMetadata';
import { isString } from '@sniptt/guards';


export const isFieldPipelineStepValue = (
  fieldValue: unknown,
): fieldValue is FieldPipelineStepValue => isString(fieldValue);
