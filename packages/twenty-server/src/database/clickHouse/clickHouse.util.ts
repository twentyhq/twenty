/**
 * Formats a Date for ClickHouse DateTime64(3) type.
 * ClickHouse expects: YYYY-MM-DD HH:mm:ss.SSS (no 'T' separator, no 'Z' suffix)
 * JavaScript toISOString() returns: YYYY-MM-DDTHH:mm:ss.SSSZ
 */
export const formatDateForClickHouse = (date: Date): string => {
  const iso = date.toISOString();

  // Extract date (YYYY-MM-DD) and time with milliseconds (HH:mm:ss.SSS)
  return `${iso.slice(0, 10)} ${iso.slice(11, 23)}`;
};

