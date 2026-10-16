import { doNotTranslate } from 'twenty-shared/utils';

export const detectTimeZone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return doNotTranslate('UTC');
  }
};
