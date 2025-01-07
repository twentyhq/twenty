import { InputSchema } from '@/workflow/types/InputSchema';
import { FunctionInput } from '@/workflow/workflow-steps/workflow-actions/types/FunctionInput';
import { isDefined } from '~/utils/isDefined';

export const getDefaultFunctionInputFromInputSchema = (
  inputSchema: InputSchema,
): FunctionInput => {
  return inputSchema.map((param) => {
    if (['string', 'number', 'boolean'].includes(param.type)) {
      return param.enum && param.enum.length > 0 ? param.enum[0] : null;
    } else if (param.type === 'object') {
      const result: FunctionInput = {};
      if (isDefined(param.properties)) {
        Object.entries(param.properties).forEach(([key, val]) => {
          result[key] = getDefaultFunctionInputFromInputSchema([val])[0];
        });
      }
      return result;
    } else if (param.type === 'array' && isDefined(param.items)) {
      return [];
    }
    return null;
  });
};
