import {
  OutputSchema,
  LinkOutputSchema,
} from '@/workflow/search-variables/types/StepOutputSchema';

export const isLinkOutputSchema = (
  outputSchema: OutputSchema,
): outputSchema is LinkOutputSchema => {
  return outputSchema._outputSchemaType === 'LINK';
};
