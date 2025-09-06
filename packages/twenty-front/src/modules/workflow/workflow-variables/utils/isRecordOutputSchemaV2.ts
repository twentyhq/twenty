import { type RecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/RecordOutputSchemaV2';
import { type OutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { isObject } from '@sniptt/guards';

export const isRecordOutputSchemaV2 = (
  outputSchema: OutputSchemaV2,
): outputSchema is RecordOutputSchemaV2 => {
  return (
    isObject(outputSchema) &&
    '_outputSchemaType' in outputSchema &&
    outputSchema._outputSchemaType === 'RECORD'
  );
};
