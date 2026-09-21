// ClickHouse DateTime64(3) expects YYYY-MM-DD HH:mm:ss.SSS (no 'T' separator,
// no 'Z' suffix), while toISOString() returns YYYY-MM-DDTHH:mm:ss.SSSZ.
export const formatDateTimeForClickHouse = (date: Date | string): string => {
  const iso = typeof date === 'string' ? date : date.toISOString();

  return `${iso.slice(0, 10)} ${iso.slice(11, 23)}`;
};
