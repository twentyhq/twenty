import { getDefaultFunctionInputFromInputSchema } from '@/logic-functions/utils/getDefaultFunctionInputFromInputSchema';
import { type FunctionInput } from '@/workflow/workflow-steps/workflow-actions/code-action/types/FunctionInput';
import { isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const getFunctionInputFromSourceCode = async (
  sourceCode?: string,
): Promise<FunctionInput> => {
  if (!isDefined(sourceCode)) {
    throw new Error('Source code is not defined');
  }

  const { getFunctionInputSchema } = await import(
    '@/logic-functions/utils/getFunctionInputSchema'
  );
  const functionInputSchema = getFunctionInputSchema(sourceCode);

  const result = getDefaultFunctionInputFromInputSchema(functionInputSchema)[0];

  if (!isObject(result)) {
    return {};
  }

  return result;
};
