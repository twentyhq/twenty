import { isNonEmptyString, isObject } from '@sniptt/guards';

export const asRecord = (value: unknown): Record<string, unknown> =>
  isObject<Record<string, unknown>, unknown>(value)
    ? (value as Record<string, unknown>)
    : {};

export const readOptionalString = (value: unknown): string | undefined =>
  isNonEmptyString(value) ? value : undefined;
