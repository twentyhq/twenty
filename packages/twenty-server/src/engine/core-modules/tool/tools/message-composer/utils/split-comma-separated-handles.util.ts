export const splitCommaSeparatedHandles = (
  value: string | undefined,
): string[] =>
  (value ?? '')
    .split(',')
    .map((handle) => handle.trim())
    .filter((handle) => handle.length > 0);
