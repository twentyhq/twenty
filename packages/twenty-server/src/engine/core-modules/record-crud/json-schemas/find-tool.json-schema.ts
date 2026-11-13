import { type JSONSchema7 } from 'json-schema';

import { FIND_RECORDS_TOOL_DEFAULT_LIMIT } from 'src/engine/core-modules/record-crud/constants/find-records-tool-default-limit.constant';
import { generateRecordOrderByJsonSchema } from 'src/engine/core-modules/record-crud/json-schemas/order-by.json-schema';
import { generateRecordFilterJsonSchema } from 'src/engine/core-modules/record-crud/json-schemas/record-filter.json-schema';
import { type JsonSchemaDefinitions } from 'src/engine/core-modules/record-crud/types/json-schema-definitions.type';
import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { buildObjectJsonSchema } from 'src/engine/core-modules/record-crud/utils/build-object-json-schema.util';

export const generateFindToolInputSchema = ({
  objectMetadata,
  unreadableFieldMetadataIds,
}: {
  objectMetadata: Pick<ObjectMetadataForToolSchema, 'fields'>;
  unreadableFieldMetadataIds?: ReadonlySet<string>;
}): JSONSchema7 => {
  const definitions: JsonSchemaDefinitions = {};

  const { properties: filterProperties } = generateRecordFilterJsonSchema({
    objectMetadata,
    unreadableFieldMetadataIds,
    definitions,
  });

  return buildObjectJsonSchema({
    properties: {
      limit: {
        description: `Maximum number of records to return (default: ${FIND_RECORDS_TOOL_DEFAULT_LIMIT}, max: 100). Start small and increase only if needed.`,
        default: FIND_RECORDS_TOOL_DEFAULT_LIMIT,
        type: 'integer',
        exclusiveMinimum: 0,
      },
      offset: {
        description: 'Number of records to skip (default: 0)',
        default: 0,
        type: 'integer',
      },
      orderBy: generateRecordOrderByJsonSchema({
        objectMetadata,
        unreadableFieldMetadataIds,
        definitions,
      }),
      select: {
        description:
          `Fields to include in the response. Required. ` +
          `Use '*' to return all fields, or list specific field names. ` +
          `Relation fields resolve to related records as {id, label} summaries: ` +
          `MANY_TO_ONE returns a single object (or select the '<name>Id' FK column for just the id), ` +
          `ONE_TO_MANY returns up to 60 related records. ` +
          `For more fields or more records, query the related object directly. `,
        minItems: 1,
        type: 'array',
        items: { type: 'string' },
      },
      ...filterProperties,
    },
    required: ['select'],
    definitions,
  });
};
