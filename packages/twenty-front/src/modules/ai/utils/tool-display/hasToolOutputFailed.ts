import { isObject } from '@sniptt/guards';

export const hasToolOutputFailed = (output: unknown): boolean =>
  isObject(output) && 'success' in output && output.success === false;
