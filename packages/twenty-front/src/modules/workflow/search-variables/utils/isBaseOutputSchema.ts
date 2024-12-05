import {
  BaseOutputSchema,
  OutputSchema,
} from '@/workflow/search-variables/types/StepOutputSchema';

export const isBaseOutputSchema = (
  outputSchema: OutputSchema,
): outputSchema is BaseOutputSchema => {
  return !outputSchema._outputSchemaType;
};
