import { isObject } from '@sniptt/guards';

export const isFailedToolOutput = (
  output: unknown,
): output is { success: false; error?: unknown; message?: unknown } =>
  isObject(output) && 'success' in output && output.success === false;
