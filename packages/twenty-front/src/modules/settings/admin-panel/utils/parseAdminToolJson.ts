import { isString } from '@sniptt/guards';
import { type JsonValue } from 'type-fest';
import { isDefined } from 'twenty-shared/utils';

export const parseAdminToolJson = (value: unknown): JsonValue | null => {
  if (!isDefined(value)) {
    return null;
  }

  if (isString(value)) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  return value as JsonValue;
};
