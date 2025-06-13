import { InputSchemaPropertyType } from '@/workflow/types/InputSchema';
import { BaseOutputSchema } from '@/workflow/workflow-variables/types/StepOutputSchema';

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
): BaseOutputSchema => {
  if (typeof responseData !== 'object' || responseData === null) {
    return {};
  }

  const schema: BaseOutputSchema = {};
  Object.entries(responseData).forEach(([key, value]) => {
    const type = getValueType(value);

    switch (type) {
      case 'string':
        schema[key] = {
          isLeaf: true,
          type: 'string',
          label: key,
          value,
          icon: 'IconAbc',
        };
        break;
      case 'number':
        schema[key] = {
          isLeaf: true,
          type: 'number',
          label: key,
          value,
          icon: 'IconText',
        };
        break;
      case 'boolean':
        schema[key] = {
          isLeaf: true,
          type: 'boolean',
          label: key,
          value,
          icon: 'IconCheckbox',
        };
        break;
      case 'array':
      case 'object':
        schema[key] = {
          isLeaf: false,
          label: key,
          value: getHttpRequestOutputSchema(value),
          icon: 'IconBox',
        };
        break;
      case 'unknown':
      default:
        schema[key] = {
          isLeaf: true,
          type: 'unknown',
          label: key,
          value: value === null ? null : String(value),
          icon: 'IconQuestionMark',
        };
        break;
    }
  });
  return schema;
};
