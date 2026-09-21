const parseBreakGlassEmails = (
  breakGlassEmails: string | undefined,
): string[] => {
  if (typeof breakGlassEmails !== 'string') {
    return [];
  }

  return breakGlassEmails
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
};

export const isBreakGlassEmail = (
  email: string | undefined,
  breakGlassEmails: string | undefined,
): boolean => {
  if (typeof email !== 'string' || email.length === 0) {
    return false;
  }

  return parseBreakGlassEmails(breakGlassEmails).includes(
    email.trim().toLowerCase(),
  );
};
