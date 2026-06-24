import { isNonEmptyArray } from '@sniptt/guards';

export const toJsonArray = (value: unknown): unknown[] | undefined =>
  isNonEmptyArray(value) ? value : undefined;
