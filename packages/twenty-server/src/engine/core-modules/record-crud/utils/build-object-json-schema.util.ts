import { type JSONSchema7 } from 'json-schema';

import { type JsonSchemaDefinitions } from 'src/engine/core-modules/record-crud/types/json-schema-definitions.type';

export const buildObjectJsonSchema = ({
  properties,
  required = [],
  definitions = {},
  isStrict = false,
}: {
  properties: Record<string, JSONSchema7>;
  required?: string[];
  definitions?: JsonSchemaDefinitions;
  isStrict?: boolean;
}): JSONSchema7 => ({
  type: 'object',
  properties,
  ...(required.length > 0 && { required }),
  ...(isStrict && { additionalProperties: false }),
  ...(Object.keys(definitions).length > 0 && { $defs: definitions }),
});
