import { isArray, isObject } from '@sniptt/guards';

export const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  isObject<Record<string, unknown>, unknown>(value) && !isArray(value)
    ? value
    : undefined;
