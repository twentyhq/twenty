import { format } from 'date-fns';

export const validateCustomDateFormat = (formatString: string): boolean => {
  try {
    format(new Date(), formatString);
    return true;
  } catch {
    return false;
  }
};
