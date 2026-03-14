export const isValidTimeZone = (timeZone: string): boolean => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone });

    return true;
  } catch {
    return false;
  }
};
