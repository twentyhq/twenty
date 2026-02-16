import { type FunctionInput } from '@/workflow/workflow-steps/workflow-actions/code-action/types/FunctionInput';
import { isObject } from '@sniptt/guards';

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
