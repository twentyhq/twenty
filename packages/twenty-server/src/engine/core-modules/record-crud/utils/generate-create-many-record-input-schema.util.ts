import { type JSONSchema7 } from 'json-schema';
import { type RestrictedFieldsPermissions } from 'twenty-shared/types';

import { generateRecordPropertiesJsonSchema } from 'src/engine/core-modules/record-crud/json-schemas/record-properties.json-schema';
import { type JsonSchemaDefinitions } from 'src/engine/core-modules/record-crud/types/json-schema-definitions.type';
import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { buildObjectJsonSchema } from 'src/engine/core-modules/record-crud/utils/build-object-json-schema.util';

export const generateCreateManyRecordInputSchema = ({
  objectMetadata,
  restrictedFields,
}: {
  objectMetadata: Pick<ObjectMetadataForToolSchema, 'fields'>;
  restrictedFields?: RestrictedFieldsPermissions;
}): JSONSchema7 => {
  const definitions: JsonSchemaDefinitions = {};

  return buildObjectJsonSchema({
    properties: {
      records: {
        description:
          'Array of records to create. Each record should contain the required fields. Maximum 20 records per call.',
        minItems: 1,
        maxItems: 20,
        type: 'array',
        items: buildObjectJsonSchema(
          generateRecordPropertiesJsonSchema({
            objectMetadata,
            restrictedFields,
            definitions,
          }),
        ),
      },
    },
    required: ['records'],
    definitions,
  });
};
