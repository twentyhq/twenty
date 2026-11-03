import { type InputJsonSchema } from 'twenty-sdk/define';

import specification from 'src/schemas/operations.json';

type Schema = {
  $ref?: string;
  type?: InputJsonSchema['type'];
  description?: string;
  enum?: unknown[];
  required?: string[];
  minimum?: number;
  maximum?: number;
  minItems?: number;
  maxItems?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
  additionalProperties?: boolean;
  properties?: Record<string, Schema>;
  items?: Schema;
  anyOf?: Schema[];
  allOf?: Schema[];
};

export const toToolSchema = (input: unknown): InputJsonSchema => {
  const schema = input as Schema;
  if (schema.$ref) {
    const name = schema.$ref.split('/').pop()!;
    return toToolSchema(
      (specification.components.schemas as Record<string, Schema>)[name],
    );
  }
  if (schema.anyOf) {
    return toToolSchema(schema.anyOf.find((choice) => choice.type !== 'null')!);
  }
  if (schema.allOf) {
    return Object.assign({}, ...schema.allOf.map(toToolSchema));
  }

  // Twenty's InputJsonSchema supports numeric bounds but not these JSON Schema
  // keywords. Preserve them in tool-visible metadata; Ajv enforces them at runtime.
  const constraints = (
    [
      'minItems',
      'maxItems',
      'minLength',
      'maxLength',
      'pattern',
      'format',
    ] as const
  )
    .filter((key) => schema[key] !== undefined)
    .map((key) => `${key}: ${schema[key]}`);
  const description = [
    schema.description,
    constraints.length ? `Constraints: ${constraints.join('; ')}.` : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return {
    ...(schema.type ? { type: schema.type } : {}),
    ...(description ? { description } : {}),
    ...(schema.enum ? { enum: schema.enum } : {}),
    ...(schema.required ? { required: schema.required } : {}),
    ...(schema.minimum !== undefined ? { minimum: schema.minimum } : {}),
    ...(schema.maximum !== undefined ? { maximum: schema.maximum } : {}),
    ...(schema.additionalProperties !== undefined
      ? { additionalProperties: schema.additionalProperties }
      : {}),
    ...(schema.properties
      ? {
          properties: Object.fromEntries(
            Object.entries(schema.properties).map(([name, property]) => [
              name,
              toToolSchema(property),
            ]),
          ),
        }
      : {}),
    ...(schema.items ? { items: toToolSchema(schema.items) } : {}),
  };
};
