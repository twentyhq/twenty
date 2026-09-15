import { isArray, isObject } from '@sniptt/guards';

export const toJsonObject = (
  value: unknown,
): Record<string, unknown> | undefined => {
  if (!isObject(value) || isArray(value)) {
    return undefined;
  }

  const valuePrototype = Object.getPrototypeOf(value);
  const isPlainObject =
    valuePrototype === Object.prototype || valuePrototype === null;
  if (!isPlainObject) {
    return undefined;
  }

  if (Object.keys(value).length === 0) {
    return undefined;
  }

  return value as Record<string, unknown>;
};
