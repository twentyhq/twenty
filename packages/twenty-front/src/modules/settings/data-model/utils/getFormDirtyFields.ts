export type DirtyFieldsType =
  | boolean
  | null
  | {
      [key: string]: DirtyFieldsType;
    }
  | DirtyFieldsType[];

export const getDirtyValues = <T extends Record<string, any>>(
  dirtyFields: Partial<Record<keyof T, DirtyFieldsType>>,
  values: T,
): Partial<T> => {
  const dirtyValues = Object.keys(dirtyFields).reduce((prev, key) => {
    const value = dirtyFields[key];
    if (!value) {
      return prev;
    }
    const isObject = typeof value === 'object';
    const isArray = Array.isArray(value);
    const nestedValue =
      isObject && !isArray
        ? getDirtyValues(value as Record<string, any>, values[key])
        : values[key];
    return { ...prev, [key]: isArray ? values[key] : nestedValue };
  }, {} as Partial<T>);
  return dirtyValues;
};
