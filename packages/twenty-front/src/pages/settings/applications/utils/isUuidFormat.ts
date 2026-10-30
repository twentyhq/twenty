import { isNonEmptyString } from '@sniptt/guards';

const UUID_FORMAT_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuidFormat = (value: string | undefined): value is string =>
  isNonEmptyString(value) && UUID_FORMAT_REGEX.test(value);
