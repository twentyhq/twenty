import { isInteger } from '@sniptt/guards';

export const getNonNegativeIntegerValue = (value: string): number | null => {
  const trimmedValue = value.trim();

  if (trimmedValue === '') {
    return null;
  }

  const parsedValue = Number(trimmedValue);

  return isInteger(parsedValue) && parsedValue >= 0 ? parsedValue : null;
};
