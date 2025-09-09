import { type LinkOutputSchema } from '@/workflow/workflow-variables/types/LinkOutputSchema';
import { type OutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { isObject } from '@sniptt/guards';

export const isLinkOutputSchema = (
  outputSchema: OutputSchemaV2,
): outputSchema is LinkOutputSchema => {
  return (
    isObject(outputSchema) &&
    '_outputSchemaType' in outputSchema &&
    outputSchema._outputSchemaType === 'LINK'
  );
};
