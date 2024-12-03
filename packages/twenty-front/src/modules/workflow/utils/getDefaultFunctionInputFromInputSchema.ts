import { InputSchema } from '@/workflow/types/InputSchema';
import { FunctionInput } from '@/workflow/types/FunctionInput';
import { isDefined } from '~/utils/isDefined';

export const getDefaultFunctionInputFromInputSchema = (
  inputSchema: InputSchema | undefined,
): FunctionInput => {
  return isDefined(inputSchema)
    ? Object.entries(inputSchema).reduce((acc, [key, value]) => {
        if (['string', 'number', 'boolean'].includes(value.type)) {
          acc[key] = null;
        } else if (value.type === 'object') {
          acc[key] = isDefined(value.properties)
            ? getDefaultFunctionInputFromInputSchema(value.properties)
            : {};
        } else if (value.type === 'array' && isDefined(value.items)) {
          acc[key] = [];
        }
        return acc;
      }, {} as FunctionInput)
    : {};
};
