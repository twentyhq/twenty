import {
  BaseOutputSchema,
  OutputSchema,
} from '@/workflow/workflow-variables/types/StepOutputSchema';

export const isBaseOutputSchema = (
  outputSchema: OutputSchema,
): outputSchema is BaseOutputSchema => {
  return !outputSchema._outputSchemaType;
};
