import { isDeeplyEqual } from './isDeeplyEqual';

export const getDirtyFields = <T extends Record<string, any>>(
  draft: T,
  persisted: T | null | undefined,
): Partial<T> => {
  if (!persisted) {
    return Object.fromEntries(
      Object.entries(draft).filter(([, value]) => value !== undefined),
    ) as Partial<T>;
  }

  const dirty: Partial<T> = {};
  const allKeys = new Set([...Object.keys(draft), ...Object.keys(persisted)]);

  for (const key of allKeys) {
    const draftValue = draft[key as keyof T];
    const persistedValue = persisted[key as keyof T];

    if (!isDeeplyEqual(draftValue, persistedValue)) {
      dirty[key as keyof T] = draftValue;
    }
  }

  return dirty;
};
