import { type BaseOutputSchemaV2 } from '@/workflow/workflow-variables/types/BaseOutputSchemaV2';
import { type OutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { isObject } from '@sniptt/guards';

export const isBaseOutputSchemaV2 = (
  outputSchema: OutputSchemaV2,
): outputSchema is BaseOutputSchemaV2 => {
  return !(isObject(outputSchema) && '_outputSchemaType' in outputSchema);
};
