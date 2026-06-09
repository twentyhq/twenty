import { isPlainObject } from 'twenty-shared/utils';
import { type FunctionInput } from 'twenty-shared/workflow';

export const mergeDefaultFunctionInputAndFunctionInput = ({
  newInput,
  oldInput,
}: {
  newInput: FunctionInput;
  oldInput: FunctionInput;
}): FunctionInput => {
  const result: FunctionInput = {};

  for (const key of Object.keys(newInput)) {
    const newValue = newInput[key];
    const oldValue = oldInput[key];

    if (!(key in oldInput)) {
      result[key] = newValue;
    } else if (newValue === null && isPlainObject(oldValue)) {
      result[key] = null;
    } else if (isPlainObject(newValue)) {
      result[key] = mergeDefaultFunctionInputAndFunctionInput({
        newInput: newValue,
        oldInput: isPlainObject(oldValue) ? oldValue : {},
      });
    } else {
      result[key] = oldValue;
    }
  }

  return result;
};
