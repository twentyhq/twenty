export const extractNonEmptyEmails = (entries: { value: string }[]): string[] =>
  entries
    .map((entry) => entry.value.trim())
    .filter((value) => value.length > 0);
