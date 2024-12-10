import { InputSchemaPropertyType } from '@/workflow/types/InputSchema';
import { BaseOutputSchema } from '@/workflow/search-variables/types/StepOutputSchema';

export const getFunctionOutputSchema = (
  serverlessFunctionTestResult: object,
) => {
  return serverlessFunctionTestResult
    ? Object.entries(serverlessFunctionTestResult).reduce(
        (acc: BaseOutputSchema, [key, value]) => {
          acc[key] = {
            isLeaf: true,
            value,
            type: typeof value as InputSchemaPropertyType,
          };

          return acc;
        },
        {},
      )
    : {};
};
