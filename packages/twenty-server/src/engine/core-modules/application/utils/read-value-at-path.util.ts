import { isObject } from '@sniptt/guards';

export const readValueAtPath = (value: unknown, path: string): unknown =>
  path
    .split('.')
    .reduce<unknown>(
      (currentValue, key) =>
        isObject(currentValue)
          ? (currentValue as Record<string, unknown>)[key]
          : undefined,
      value,
    );
