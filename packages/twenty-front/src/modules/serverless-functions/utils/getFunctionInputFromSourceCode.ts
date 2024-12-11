import { getFunctionInputSchema } from '@/serverless-functions/utils/getFunctionInputSchema';
import { getDefaultFunctionInputFromInputSchema } from '@/serverless-functions/utils/getDefaultFunctionInputFromInputSchema';
import { FunctionInput } from '@/workflow/types/FunctionInput';
import { isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-ui';

export const getFunctionInputFromSourceCode = (
  sourceCode?: string,
): FunctionInput => {
  if (!isDefined(sourceCode)) {
    throw Error('Source code is not defined');
  }

  const functionInputSchema = getFunctionInputSchema(sourceCode);

  if (functionInputSchema.length !== 1) {
    throw Error('Function should have one object parameter');
  }

  const result = getDefaultFunctionInputFromInputSchema(functionInputSchema)[0];

  if (!isObject(result)) {
    throw Error('Function should have one object parameter');
  }

  return result;
};
