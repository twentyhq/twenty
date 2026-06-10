// Recall timestamps carry microsecond precision (2026-06-10T12:17:28.281597+00:00),
// which Twenty's date-time validation rejects; truncate to millisecond ISO.
export const normalizeRecallTimestamp = (
  value: string | undefined,
): string | undefined => {
  if (value === undefined) {
    return undefined;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
};
