// SELECT values arrive as API enum-like strings such as IN_PROGRESS.
export const humanizeSelectValue = (value: string): string => {
  const words = value.replace(/_/g, ' ').toLowerCase();

  return words.charAt(0).toUpperCase() + words.slice(1);
};
