import { type BaseOutputSchemaV2 } from 'twenty-shared/workflow';

export const convertOutputSchemaToJson = (
  schema: BaseOutputSchemaV2,
): Record<string, unknown> | unknown[] => {
  const keys = Object.keys(schema);

  if (keys.length === 0) {
    return {};
  }

  const isArray = keys.every((key, index) => key === String(index));

  if (isArray) {
    return keys.map((key) => {
      const entry = schema[key];
      if (entry.isLeaf) {
        return entry.value;
      }
      return convertOutputSchemaToJson(entry.value as BaseOutputSchemaV2);
    });
  }

  const result: Record<string, unknown> = {};

  Object.entries(schema).forEach(([key, entry]) => {
    if (entry.isLeaf) {
      result[key] = entry.value;
    } else {
      result[key] = convertOutputSchemaToJson(
        entry.value as BaseOutputSchemaV2,
      );
    }
  });

  return result;
};
