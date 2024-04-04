import { isNonEmptyString } from '@sniptt/guards';

export const lowerAndCapitalize = (stringToCapitalize: string) => {
  if (!isNonEmptyString(stringToCapitalize)) return '';

  const loweredString = stringToCapitalize.toLowerCase();

  return loweredString[0].toUpperCase() + loweredString.slice(1);
};
