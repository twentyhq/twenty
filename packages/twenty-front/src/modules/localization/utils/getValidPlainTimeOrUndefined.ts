import { isNonEmptyString } from '@sniptt/guards';
import { Temporal } from 'temporal-polyfill';

export const getValidPlainTimeOrUndefined = (
  time: string,
): Temporal.PlainTime | undefined => {
  if (!isNonEmptyString(time)) {
    return undefined;
  }

  try {
    return Temporal.PlainTime.from(time);
  } catch {
    return undefined;
  }
};
