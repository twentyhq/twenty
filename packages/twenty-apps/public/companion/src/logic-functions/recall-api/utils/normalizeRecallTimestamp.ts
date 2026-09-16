// Twenty rejects Recall's microsecond precision; truncate to millisecond ISO.
export const normalizeRecallTimestamp = (
  value: string | undefined,
): string | undefined => {
  if (value === undefined) {
    return undefined;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
};
