import {
  OutputSchema,
  RecordOutputSchema,
} from '@/workflow/search-variables/types/StepOutputSchema';

export const isRecordOutputSchema = (
  outputSchema: OutputSchema,
): outputSchema is RecordOutputSchema => {
  return outputSchema._outputSchemaType === 'RECORD';
};
