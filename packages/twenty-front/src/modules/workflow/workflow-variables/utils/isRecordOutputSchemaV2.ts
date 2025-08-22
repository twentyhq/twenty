import {
  type RecordFieldLeaf,
  type RecordOutputSchemaV2,
} from '@/workflow/workflow-variables/types/RecordOutputSchemaV2';

export const isRecordOutputSchemaV2 = (
  outputSchema: RecordOutputSchemaV2 | Record<string, RecordFieldLeaf>,
): outputSchema is RecordOutputSchemaV2 => {
  return outputSchema._outputSchemaType === 'RECORD';
};
