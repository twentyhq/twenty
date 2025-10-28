import { type InputSchemaPropertyType } from '@/workflow/types/InputSchema';
import { type BaseOutputSchemaV2 } from 'twenty-shared/workflow';

const getValueType = (value: unknown): InputSchemaPropertyType => {
  if (value === null || value === undefined) {
    return 'unknown';
  }
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
  if (typeof value === 'object') {
    return 'object';
  }
  return 'unknown';
};

export const getHttpRequestOutputSchema = (
  responseData: unknown,
): BaseOutputSchemaV2 => {
  if (typeof responseData !== 'object' || responseData === null) {
    return {};
  }

  const schema: BaseOutputSchemaV2 = {};
  Object.entries(responseData).forEach(([key, value]) => {
    const type = getValueType(value);

    switch (type) {
      case 'string':
        schema[key] = {
          isLeaf: true,
          type: 'string',
          label: key,
          value,
        };
        break;
      case 'number':
        schema[key] = {
          isLeaf: true,
          type: 'number',
          label: key,
          value,
        };
        break;
      case 'boolean':
        schema[key] = {
          isLeaf: true,
          type: 'boolean',
          label: key,
          value,
        };
        break;
      case 'array':
        schema[key] = {
          isLeaf: true,
          label: key,
          type: 'array',
          value,
        };
        break;
      case 'object':
        schema[key] = {
          isLeaf: false,
          label: key,
          value: getHttpRequestOutputSchema(value),
          type: 'object',
        };
        break;
      case 'unknown':
      default:
        schema[key] = {
          isLeaf: true,
          type: 'unknown',
          label: key,
          value: value === null ? null : String(value),
        };
        break;
    }
  });
  return schema;
};
