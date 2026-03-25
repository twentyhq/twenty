import { type OutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { isObject } from '@sniptt/guards';
import { type BaseOutputSchemaV2 } from 'twenty-shared/workflow';

export const isBaseOutputSchemaV2 = (
  outputSchema: OutputSchemaV2,
): outputSchema is BaseOutputSchemaV2 => {
  return !(isObject(outputSchema) && '_outputSchemaType' in outputSchema);
};
