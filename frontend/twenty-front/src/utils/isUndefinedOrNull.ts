import { isNull, isUndefined } from '@sniptt/guards';

export const isUndefinedOrNull = (value: any): value is null | undefined =>
  isUndefined(value) || isNull(value);
