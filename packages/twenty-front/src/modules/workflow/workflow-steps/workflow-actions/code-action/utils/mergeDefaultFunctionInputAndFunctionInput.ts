import { type FunctionInput } from 'twenty-shared/workflow';
import { isObject } from '@sniptt/guards';

export const mergeDefaultFunctionInputAndFunctionInput = ({
  newInput,
  oldInput,
}: {
  newInput: FunctionInput;
  oldInput: FunctionInput | undefined;
}): FunctionInput => {
  const result: FunctionInput = {};
  const safeOldInput = oldInput ?? {};

  for (const key of Object.keys(newInput)) {
    const newValue = newInput[key];
    const oldValue = safeOldInput[key];

    if (!(key in safeOldInput)) {
      result[key] = newValue;
    } else if (newValue === null && isObject(oldValue)) {
      result[key] = null;
    } else if (isObject(newValue)) {
      result[key] = mergeDefaultFunctionInputAndFunctionInput({
        newInput: newValue,
        oldInput: isObject(oldValue) ? oldValue : {},
      });
    } else {
      result[key] = oldValue;
    }
  }

  return result;
};
