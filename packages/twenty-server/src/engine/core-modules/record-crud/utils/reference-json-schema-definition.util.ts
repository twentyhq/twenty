import { type JSONSchema7 } from 'json-schema';

import { type JsonSchemaDefinitions } from 'src/engine/core-modules/record-crud/types/json-schema-definitions.type';

export const referenceJsonSchemaDefinition = ({
  definitions,
  name,
  schema,
}: {
  definitions: JsonSchemaDefinitions;
  name: string;
  schema: JSONSchema7;
}): JSONSchema7 => {
  definitions[name] = schema;

  return { $ref: `#/$defs/${name}` };
};
