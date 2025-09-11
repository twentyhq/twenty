import { isDefined } from 'twenty-shared/utils';

export const isHandleEqual = (
  handleA: string | null | undefined,
  handleB: string | null | undefined,
) => {
  if (!isDefined(handleA) && !isDefined(handleB)) {
    return true;
  }

  return handleA === handleB;
};
