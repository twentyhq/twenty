import { isString } from '@sniptt/guards';

export const isValidJSON = (str: string) => {
  try {
    if (isString(JSON.parse(str))) {
      throw new Error(`Strings are not supported as JSON: ${str}`);
    }
    return true;
  } catch (error) {
    return false;
  }
};
