export const extractEmailsList = (emails: string) => {
  return Array.from(
    new Set(
      emails
        .split(',')
        .map((email) => email.trim())
        .filter((email) => email.length > 0),
    ),
  );
};
