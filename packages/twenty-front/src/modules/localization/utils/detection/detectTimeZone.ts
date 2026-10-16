export const detectTimeZone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    // oxlint-disable-next-line lingui/no-unlocalized-strings -- This is a date format or time-zone identifier.
    return 'UTC';
  }
};
