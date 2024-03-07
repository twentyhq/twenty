import { isNull, isUndefined } from '@sniptt/guards';

export const isNullable = (value: any): value is null | undefined =>
  isUndefined(value) || isNull(value);
