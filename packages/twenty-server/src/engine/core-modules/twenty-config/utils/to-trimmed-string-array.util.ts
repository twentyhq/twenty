import { isString } from '@sniptt/guards';

const trimAndDropEmpty = (items: string[]) =>
  items.map((item) => item.trim()).filter((item) => item.length > 0);

// ARRAY config variables are parsed into arrays before custom casts run.
export const toTrimmedStringArray = (value: unknown): string[] | undefined => {
  if (isString(value)) {
    return trimAndDropEmpty(value.split(','));
  }

  if (Array.isArray(value)) {
    return trimAndDropEmpty(value.map(String));
  }

  return undefined;
};
