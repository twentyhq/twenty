import { type RecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/RecordOutputSchemaV2';
import { isObject } from '@sniptt/guards';

export const isRecordOutputSchemaV2 = (
  outputSchema: unknown,
): outputSchema is RecordOutputSchemaV2 => {
  return (
    isObject(outputSchema) &&
    '_outputSchemaType' in outputSchema &&
    outputSchema._outputSchemaType === 'RECORD'
  );
};
