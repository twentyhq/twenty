import { type InputSchema } from '@/workflow/types/InputSchema';
import { type FunctionInput } from '@/workflow/workflow-steps/workflow-actions/code-action/types/FunctionInput';
import { isDefined } from 'twenty-shared/utils';
import type { InputJsonSchema } from 'twenty-shared/logic-function';

export const getFunctionInputFromInputSchema = (
  inputSchema: InputSchema | InputJsonSchema[],
): FunctionInput => {
  return inputSchema.map((param) => {
    if (
      isDefined(param.type) &&
      ['string', 'number', 'boolean'].includes(param.type)
    ) {
      return param.enum && param.enum.length > 0 ? param.enum[0] : null;
    } else if (param.type === 'object') {
      const result: FunctionInput = {};
      if (isDefined(param.properties)) {
        Object.entries(param.properties).forEach(([key, val]) => {
          result[key] = getFunctionInputFromInputSchema([val])[0];
        });
      }
      return result;
    } else if (param.type === 'array' && isDefined(param.items)) {
      return [];
    }
    return null;
  });
};
