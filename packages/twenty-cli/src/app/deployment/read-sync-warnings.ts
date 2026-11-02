import { isArray, isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

export const readSyncWarnings = (value: unknown): string[] =>
  isPlainObject(value) && isArray(value.warnings)
    ? value.warnings.filter(isString)
    : [];
