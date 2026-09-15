// ClickHouse returns DateTime64 values as naive strings (YYYY-MM-DD HH:mm:ss.SSS) in UTC.
// Parse them as UTC explicitly, otherwise `new Date` assumes the server's local timezone.
export const parseClickHouseDateTime = (value: string): Date =>
  new Date(`${value.replace(' ', 'T')}Z`);
