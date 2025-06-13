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
  Object.entries(responseData).forEach(([key, val]) => {
    const type = getValueType(val);

    switch (type) {
      case 'string':
        schema[key] = {
          isLeaf: true,
          type: 'string',
          label: key,
          value: val as string,
          icon: 'IconText',
        };
        break;
      case 'number':
        schema[key] = {
          isLeaf: true,
          type: 'number',
          label: key,
          value: val as number,
          icon: 'IconNumber',
        };
        break;
      case 'boolean':
        schema[key] = {
          isLeaf: true,
          type: 'boolean',
          label: key,
          value: val as boolean,
          icon: 'IconCheckbox',
        };
        break;
      case 'array':
      case 'object':
        schema[key] = {
          isLeaf: false,
          label: key,
          value: getHttpRequestOutputSchema(val),
          icon: 'IconBox',
        };
        break;
      case 'unknown':
      default:
        schema[key] = {
          isLeaf: true,
          type: 'unknown',
          label: key,
          value: val === null ? null : String(val),
          icon: 'IconQuestionMark',
        };
        break;
    }
  });
  return schema;
};
