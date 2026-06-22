import { isObject } from '@sniptt/guards';

export const isToolOutputSuccessful = (output: unknown): boolean => {
  const isFailure =
    isObject(output) && 'success' in output && output.success === false;

  return !isFailure;
};
