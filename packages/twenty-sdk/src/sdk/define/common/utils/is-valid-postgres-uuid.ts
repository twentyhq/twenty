// PostgreSQL accepts UUIDs independently of their version and variant bits.
const POSTGRES_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isValidPostgresUuid = (value: string): boolean =>
  POSTGRES_UUID_PATTERN.test(value);
