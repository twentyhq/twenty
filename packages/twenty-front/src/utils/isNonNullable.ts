import { isNull, isUndefined } from '@sniptt/guards';

export const isNonNullable = <T>(value: T): value is NonNullable<T> =>
  !isUndefined(value) && !isNull(value);
