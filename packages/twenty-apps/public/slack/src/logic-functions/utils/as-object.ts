import { isObject } from '@sniptt/guards';

export const asObject = (
  value: unknown,
): Record<string, unknown> | undefined =>
  isObject<Record<string, unknown>, unknown>(value) ? value : undefined;
