import { FunctionInput } from '@/workflow/types/FunctionInput';

export const mergeDefaultFunctionInputAndFunctionInput = ({
  defaultFunctionInput,
  functionInput,
}: {
  defaultFunctionInput: FunctionInput;
  functionInput: FunctionInput;
}): FunctionInput => {
  const result: FunctionInput = {};

  for (const key of Object.keys(defaultFunctionInput)) {
    if (!(key in functionInput)) {
      result[key] = defaultFunctionInput[key];
    } else {
      if (
        defaultFunctionInput[key] !== null &&
        typeof defaultFunctionInput[key] === 'object'
      ) {
        result[key] = mergeDefaultFunctionInputAndFunctionInput({
          defaultFunctionInput: defaultFunctionInput[key],
          functionInput:
            typeof functionInput[key] === 'object' ? functionInput[key] : {},
        });
      } else {
        result[key] = functionInput[key];
      }
    }
  }

  return result;
};
