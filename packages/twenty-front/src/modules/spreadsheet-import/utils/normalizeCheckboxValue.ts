import { isNonEmptyString } from '@sniptt/guards';

const booleanWhitelist: Record<string, boolean> = {
  yes: true,
  no: false,
  true: true,
  false: false,
};

export const normalizeCheckboxValue = (value: string | undefined): boolean => {
  if (isNonEmptyString(value) && value.toLowerCase() in booleanWhitelist) {
    return booleanWhitelist[value.toLowerCase()];
  }
  return false;
};
