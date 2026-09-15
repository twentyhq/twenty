import { isArray, isObject } from '@sniptt/guards';

export const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  isObject(value) && !isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
