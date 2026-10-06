import { isPlainObject } from 'twenty-shared/utils';

export const isToolOutputAwaitedByCaller = (toolOutput: unknown): boolean =>
  isPlainObject(toolOutput) && toolOutput.awaitedByCaller === true;
