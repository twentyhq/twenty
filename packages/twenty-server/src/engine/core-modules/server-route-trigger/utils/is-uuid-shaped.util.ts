// Matches what a Postgres uuid column accepts, whatever the UUID version.
const UUID_SHAPE_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuidShaped = (value: string): boolean =>
  UUID_SHAPE_REGEX.test(value);
