import { getFunctionInputSchema } from '@/serverless-functions/utils/getFunctionInputSchema';
import { getDefaultFunctionInputFromInputSchema } from '@/serverless-functions/utils/getDefaultFunctionInputFromInputSchema';
import { FunctionInput } from '@/workflow/types/FunctionInput';
import { isObject } from '@sniptt/guards';

export const getFunctionInputFromSourceCode = (
  sourceCode?: string,
): FunctionInput => {
  const functionInputSchema = sourceCode
    ? getFunctionInputSchema(sourceCode)
    : [];

  if (functionInputSchema.length !== 1) {
    throw Error('Function should have one object parameter');
  }

  const result = getDefaultFunctionInputFromInputSchema(functionInputSchema)[0];

  if (!isObject(result)) {
    throw Error('Function should have one object parameter');
  }

  return result;
};
