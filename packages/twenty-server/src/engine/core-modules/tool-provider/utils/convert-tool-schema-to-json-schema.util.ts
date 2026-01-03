import { type ToolSchemaProperty } from 'twenty-shared/application';

type JsonSchemaType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'null'
  | 'integer';

type JsonSchemaProperty = {
  type: JsonSchemaType;
  enum?: string[];
  items?: JsonSchemaProperty;
  properties?: Record<string, JsonSchemaProperty>;
};

type JsonSchema = {
  type: 'object';
  properties: Record<string, JsonSchemaProperty>;
};

const mapToolSchemaTypeToJsonSchemaType = (
  type: string,
): JsonSchemaType => {
  // Map ToolSchemaPropertyType to valid JSON Schema types
  switch (type) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'object':
      return 'object';
    case 'array':
      return 'array';
    default:
      return 'string';
  }
};

const convertPropertyToJsonSchema = (
  property: ToolSchemaProperty,
): JsonSchemaProperty => {
  const result: JsonSchemaProperty = {
    type: mapToolSchemaTypeToJsonSchemaType(property.type),
  };

  if (property.enum) {
    result.enum = property.enum;
  }

  if (property.items) {
    result.items = convertPropertyToJsonSchema(property.items);
  }

  if (property.properties) {
    result.properties = Object.fromEntries(
      Object.entries(property.properties).map(([key, value]) => [
        key,
        convertPropertyToJsonSchema(value),
      ]),
    );
  }

  return result;
};

export const convertToolSchemaPropertyToJsonSchema = (
  schema: ToolSchemaProperty,
): JsonSchema => {
  if (schema.type !== 'object' || !schema.properties) {
    // If the schema is not an object, wrap it as an object with a single "input" property
    return {
      type: 'object',
      properties: {
        input: convertPropertyToJsonSchema(schema),
      },
    };
  }

  return {
    type: 'object',
    properties: Object.fromEntries(
      Object.entries(schema.properties).map(([key, value]) => [
        key,
        convertPropertyToJsonSchema(value),
      ]),
    ),
  };
};
