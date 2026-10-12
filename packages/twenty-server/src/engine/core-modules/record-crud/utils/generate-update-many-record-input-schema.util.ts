import { type JSONSchema7 } from 'json-schema';
import { type RestrictedFieldsPermissions } from 'twenty-shared/types';

import { generateRecordFilterJsonSchema } from 'src/engine/core-modules/record-crud/json-schemas/record-filter.json-schema';
import { generateRecordPropertiesJsonSchema } from 'src/engine/core-modules/record-crud/json-schemas/record-properties.json-schema';
import { type JsonSchemaDefinitions } from 'src/engine/core-modules/record-crud/types/json-schema-definitions.type';
import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { buildObjectJsonSchema } from 'src/engine/core-modules/record-crud/utils/build-object-json-schema.util';

export const generateUpdateManyRecordInputSchema = ({
  objectMetadata,
  restrictedFields,
}: {
  objectMetadata: Pick<ObjectMetadataForToolSchema, 'fields'>;
  restrictedFields?: RestrictedFieldsPermissions;
}): JSONSchema7 => {
  const definitions: JsonSchemaDefinitions = {};

  const { reference: filterReference } = generateRecordFilterJsonSchema({
    objectMetadata,
    restrictedFields,
    definitions,
    additionalExcludedFieldNames: ['createdAt', 'updatedAt'],
  });

  const { properties } = generateRecordPropertiesJsonSchema({
    objectMetadata,
    restrictedFields,
    definitions,
    isPartial: true,
  });

  return buildObjectJsonSchema({
    properties: {
      filter: {
        description:
          'Filter to select which records to update. Supports field-level filters and logical operators (or, and, not). WARNING: A broad filter may update many records at once. Always verify the filter scope with a find query first.',
        ...filterReference,
      },
      data: {
        description:
          'The field values to apply to all matching records. Only include fields you want to change.',
        ...buildObjectJsonSchema({ properties }),
      },
    },
    required: ['filter', 'data'],
    definitions,
  });
};
