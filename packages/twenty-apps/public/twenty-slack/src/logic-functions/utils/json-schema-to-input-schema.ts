import { type InputJsonSchema } from 'twenty-sdk/logic-function';

type InputSchemaProperty = {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'unknown';
  enum?: string[];
  items?: InputSchemaProperty;
  properties?: Record<string, InputSchemaProperty>;
  multiline?: boolean;
  label?: string;
};

const convertProperty = (jsonSchema: InputJsonSchema): InputSchemaProperty => {
  const property: InputSchemaProperty = { type: 'unknown' };

  switch (jsonSchema.type) {
    case 'string':
      property.type = 'string';
      break;
    case 'number':
    case 'integer':
      property.type = 'number';
      break;
    case 'boolean':
      property.type = 'boolean';
      break;
    case 'array':
      property.type = 'array';
      if (jsonSchema.items) {
        property.items = convertProperty(jsonSchema.items);
      }
      break;
    case 'object':
      property.type = 'object';
      if (jsonSchema.properties) {
        property.properties = Object.fromEntries(
          Object.entries(jsonSchema.properties).map(([key, value]) => [
            key,
            convertProperty(value),
          ]),
        );
      }
      break;
    default:
      property.type = 'unknown';
  }

  if (Array.isArray(jsonSchema.enum)) {
    property.enum = jsonSchema.enum.filter(
      (value): value is string => typeof value === 'string',
    );
  }

  if (jsonSchema.multiline === true) {
    property.multiline = true;
  }

  if (typeof jsonSchema.label === 'string' && jsonSchema.label.length > 0) {
    property.label = jsonSchema.label;
  }

  return property;
};

export const jsonSchemaToInputSchema = (
  jsonSchema: InputJsonSchema,
): InputSchemaProperty[] => [convertProperty(jsonSchema)];
