import { type LinkOutputSchema } from '@/workflow/workflow-variables/types/LinkOutputSchema';
import { isObject } from '@sniptt/guards';

export const isLinkOutputSchema = (
  outputSchema: unknown,
): outputSchema is LinkOutputSchema => {
  return (
    isObject(outputSchema) &&
    '_outputSchemaType' in outputSchema &&
    outputSchema._outputSchemaType === 'LINK'
  );
};
