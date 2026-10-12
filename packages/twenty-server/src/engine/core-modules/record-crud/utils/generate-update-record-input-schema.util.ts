import { type JSONSchema7 } from 'json-schema';
import { type RestrictedFieldsPermissions } from 'twenty-shared/types';

import { generateRecordPropertiesJsonSchema } from 'src/engine/core-modules/record-crud/json-schemas/record-properties.json-schema';
import { type JsonSchemaDefinitions } from 'src/engine/core-modules/record-crud/types/json-schema-definitions.type';
import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { buildObjectJsonSchema } from 'src/engine/core-modules/record-crud/utils/build-object-json-schema.util';

export const generateUpdateRecordInputSchema = ({
  objectMetadata,
  restrictedFields,
}: {
  objectMetadata: Pick<ObjectMetadataForToolSchema, 'fields'>;
  restrictedFields?: RestrictedFieldsPermissions;
}): JSONSchema7 => {
  const definitions: JsonSchemaDefinitions = {};

  const { properties } = generateRecordPropertiesJsonSchema({
    objectMetadata,
    restrictedFields,
    definitions,
    isPartial: true,
  });

  return buildObjectJsonSchema({
    properties: { ...properties, id: { type: 'string', format: 'uuid' } },
    required: ['id'],
    definitions,
  });
};
