import { isDefined } from 'twenty-shared/utils';

export const isToolOutputSuccessful = (output: unknown): boolean => {
  const isFailure =
    isDefined(output) &&
    typeof output === 'object' &&
    'success' in output &&
    output.success === false;

  return !isFailure;
};
