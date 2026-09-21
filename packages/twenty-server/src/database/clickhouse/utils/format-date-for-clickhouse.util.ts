export const formatDateForClickHouse = (date: Date): string =>
  date.toISOString().slice(0, 10);
