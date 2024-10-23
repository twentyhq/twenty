/**
 * Normalizes a time zone string for comparison.
 * Removes GMT offset, converts to lowercase, and removes non-alphanumeric characters.
 * @param timeZone The time zone string to normalize
 * @returns The normalized time zone string
 */

export const normalizeTimeZone = (timeZone: string): string => {
  return timeZone
    .replace(/^\(GMT[+-]\d{2}:\d{2}\)\s/, '') // Remove GMT offset
    .toLowerCase() // Convert to lowercase
    .replace(/[^a-z0-9]/g, ''); // Remove non-alphanumeric characters
}