import { isNull, isUndefined } from '@sniptt/guards';

export const isDefined = <TValue>(
  value: TValue | null | undefined,
): value is TValue => !isNull(value) && !isUndefined(value);
