export const parseCommaSeparatedEmails = (
  value: string | undefined,
): string[] => {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((email) => email.trim())
    .filter((email) => email.length > 0);
};
