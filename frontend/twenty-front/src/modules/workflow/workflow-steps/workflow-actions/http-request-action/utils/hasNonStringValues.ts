import { isString } from '@sniptt/guards';
import { type JsonArray, type JsonObject } from 'type-fest';

export const hasNonStringValues = (obj: JsonObject | JsonArray): boolean => {
  const values = Object.values(obj);

  if (values.length === 0) {
    return true;
  }

  return !values.every((value) => isString(value));
};
