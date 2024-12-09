import { getFunctionInputSchema } from '@/serverless-functions/utils/getFunctionInputSchema';
import { getDefaultFunctionInputFromInputSchema } from '@/serverless-functions/utils/getDefaultFunctionInputFromInputSchema';

export const getFunctionInputFromSourceCode = (sourceCode?: string) => {
  const functionInputSchema = sourceCode
    ? getFunctionInputSchema(sourceCode)
    : {};

  return getDefaultFunctionInputFromInputSchema(functionInputSchema);
};
