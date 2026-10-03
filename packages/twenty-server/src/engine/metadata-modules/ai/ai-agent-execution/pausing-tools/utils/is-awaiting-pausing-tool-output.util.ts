import { isPlainObject } from 'twenty-shared/utils';

export const isAwaitingPausingToolOutput = (toolOutput: unknown): boolean =>
  isPlainObject(toolOutput) &&
  isPlainObject(toolOutput.result) &&
  toolOutput.result.status === 'pending';
