import { isNonEmptyString } from '@sniptt/guards';

export const readSlackRecordText = (value: unknown): string | undefined => {
  if (!isNonEmptyString(value)) {
    return undefined;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length === 0 ? undefined : trimmedValue;
};
