import { isNonEmptyString, isString } from '@sniptt/guards';

export const toText = (value: unknown): string | undefined => {
  if (!isString(value)) {
    return undefined;
  }

  const trimmed = value.trim();

  return isNonEmptyString(trimmed) ? trimmed : undefined;
};
