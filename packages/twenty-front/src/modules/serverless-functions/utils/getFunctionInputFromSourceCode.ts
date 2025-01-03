import { getDefaultFunctionInputFromInputSchema } from '@/serverless-functions/utils/getDefaultFunctionInputFromInputSchema';
import { getFunctionInputSchema } from '@/serverless-functions/utils/getFunctionInputSchema';
import { FunctionInput } from '@/workflow/workflow-steps/workflow-actions/types/FunctionInput';
import { isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-ui';

export const getFunctionInputFromSourceCode = (
  sourceCode?: string,
): FunctionInput => {
  if (!isDefined(sourceCode)) {
    throw new Error('Source code is not defined');
  }

  const functionInputSchema = getFunctionInputSchema(sourceCode);

  const result = getDefaultFunctionInputFromInputSchema(functionInputSchema)[0];

  if (!isObject(result)) {
    return {};
  }

  return result;
};
