import { type JSONSchema7 } from 'json-schema';
import { type RestrictedFieldsPermissions } from 'twenty-shared/types';
import {
  isDefined,
  shouldExcludeFieldFromAgentToolSchema,
} from 'twenty-shared/utils';

import { generateFieldFilterJsonSchema } from 'src/engine/core-modules/record-crud/json-schemas/field-filters.json-schema';
import { type JsonSchemaDefinitions } from 'src/engine/core-modules/record-crud/types/json-schema-definitions.type';
import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { getManyToOneJoinColumnName } from 'src/engine/core-modules/record-crud/utils/get-many-to-one-join-column-name.util';
import { referenceJsonSchemaDefinition } from 'src/engine/core-modules/record-crud/utils/reference-json-schema-definition.util';

const RECORD_FILTER_NAME = 'RecordFilter';

const RECORD_FILTER_REFERENCE: JSONSchema7 = {
  $ref: `#/$defs/${RECORD_FILTER_NAME}`,
};

const LOGICAL_FILTER_PROPERTIES: Record<string, JSONSchema7> = {
  or: {
    description: 'OR condition - matches if ANY of the filters match',
    type: 'array',
    items: RECORD_FILTER_REFERENCE,
  },
  and: {
    description: 'AND condition - matches if ALL filters match',
    type: 'array',
    items: RECORD_FILTER_REFERENCE,
  },
  not: {
    description: 'NOT condition - matches if the filter does NOT match',
    ...RECORD_FILTER_REFERENCE,
  },
};

export const generateRecordFilterJsonSchema = ({
  objectMetadata,
  restrictedFields,
  definitions,
  additionalExcludedFieldNames = [],
}: {
  objectMetadata: Pick<ObjectMetadataForToolSchema, 'fields'>;
  restrictedFields?: RestrictedFieldsPermissions;
  definitions: JsonSchemaDefinitions;
  additionalExcludedFieldNames?: string[];
}): { properties: Record<string, JSONSchema7>; reference: JSONSchema7 } => {
  const properties: Record<string, JSONSchema7> = {};

  for (const field of objectMetadata.fields) {
    if (
      shouldExcludeFieldFromAgentToolSchema({
        fieldName: field.name,
        isSystem: field.isSystem,
        additionalExcludedFieldNames,
      }) ||
      restrictedFields?.[field.id]?.canRead === false
    ) {
      continue;
    }

    const fieldFilter = generateFieldFilterJsonSchema({ field, definitions });

    if (isDefined(fieldFilter)) {
      properties[getManyToOneJoinColumnName(field) ?? field.name] = fieldFilter;
    }
  }

  Object.assign(properties, LOGICAL_FILTER_PROPERTIES);

  const reference = referenceJsonSchemaDefinition({
    definitions,
    name: RECORD_FILTER_NAME,
    schema: { type: 'object', properties },
  });

  return { properties, reference };
};
