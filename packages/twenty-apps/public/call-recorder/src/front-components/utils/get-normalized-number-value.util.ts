// Returns undefined when the draft cannot be stored, so a half-typed number is
// kept on screen instead of being persisted as a broken value.
export const getNormalizedNumberValue = (value: string): string | undefined => {
  const trimmedValue = value.trim();

  if (trimmedValue === '') {
    return '';
  }

  const parsedValue = Number(trimmedValue);

  return Number.isFinite(parsedValue) ? String(parsedValue) : undefined;
};
