import { isObject } from '@sniptt/guards';

export const asObject = (
  value: unknown,
): Record<string, unknown> | undefined =>
  isObject(value) ? (value as Record<string, unknown>) : undefined;
