let cachedSystemTimeZone: string | undefined;

export const getSystemTimeZone = () => {
  cachedSystemTimeZone ??= Intl.DateTimeFormat().resolvedOptions().timeZone;

  return cachedSystemTimeZone;
};
