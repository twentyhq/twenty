import { isString } from '@sniptt/guards';

// Trimming variant of @sniptt/guards isNonEmptyString, for normalizing at read boundaries.
export const isNonEmptyString = (value: unknown): value is string =>
  isString(value) && value.trim() !== '';
