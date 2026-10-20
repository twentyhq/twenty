import { isArray, isNonEmptyString } from '@sniptt/guards';

export const parseRecordIds = (value: unknown): string[] =>
  isArray(value) ? [...new Set(value.filter(isNonEmptyString))] : [];
