export const isNewer = (
  candidate: string,
  current: string | null | undefined,
): boolean => !current || current < candidate;
