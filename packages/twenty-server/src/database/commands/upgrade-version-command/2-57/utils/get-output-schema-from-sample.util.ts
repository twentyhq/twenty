import { isPlainObject } from 'twenty-shared/utils';

// frozen copy of twenty-shared's getOutputSchemaFromValue as of 2.57, so this command keeps its rule
const getLeafType = (value: unknown) => {
  if (typeof value === 'string') {
    return 'string';
  }

  if (typeof value === 'number') {
    return 'number';
  }

  if (typeof value === 'boolean') {
    return 'boolean';
  }

  if (Array.isArray(value)) {
    return 'array';
  }

  return 'unknown';
};

export const getOutputSchemaFromSample = (
  sample: object,
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(sample).map(([key, value]) => [
      key,
      isPlainObject(value)
        ? {
            isLeaf: false,
            type: 'object',
            label: key,
            value: getOutputSchemaFromSample(value),
          }
        : { isLeaf: true, value, type: getLeafType(value), label: key },
    ]),
  );
