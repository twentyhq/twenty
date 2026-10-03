import { type JSONSchema7 } from 'json-schema';
import {
  AggregateOperations,
  FirstDayOfTheWeek,
  ObjectRecordGroupByDateGranularity,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import {
  isFieldMetadataArrayKind,
  isFieldMetadataDateKind,
  isFieldMetadataSupportedInGroupBy,
} from 'twenty-shared/utils';

import { getAvailableAggregationsFromObjectFields } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { generateRecordFilterJsonSchema } from 'src/engine/core-modules/record-crud/json-schemas/record-filter.json-schema';
import { type JsonSchemaDefinitions } from 'src/engine/core-modules/record-crud/types/json-schema-definitions.type';
import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { buildObjectJsonSchema } from 'src/engine/core-modules/record-crud/utils/build-object-json-schema.util';
import { referenceJsonSchemaDefinition } from 'src/engine/core-modules/record-crud/utils/reference-json-schema-definition.util';
import { getGroupableSubFieldsForCompositeType } from 'src/engine/metadata-modules/field-metadata/utils/get-groupable-sub-fields-for-composite-type.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { isManyToOneFlatFieldMetadata } from 'src/engine/twenty-orm/utils/is-many-to-one-flat-field-metadata.util';

const TRUE_JSON_SCHEMA: JSONSchema7 = { type: 'boolean', const: true };

const DATE_GROUP_BY_JSON_SCHEMA: JSONSchema7 = {
  description: 'Date field grouping configuration',
  type: 'object',
  properties: {
    granularity: {
      description: 'Date grouping granularity. Default: MONTH.',
      default: ObjectRecordGroupByDateGranularity.MONTH,
      type: 'string',
      enum: Object.values(ObjectRecordGroupByDateGranularity).filter(
        (granularity) =>
          granularity !== ObjectRecordGroupByDateGranularity.NONE,
      ),
    },
    weekStartDay: {
      description:
        'First day of week (MONDAY, SUNDAY, SATURDAY). Only used when granularity is WEEK.',
      type: 'string',
      enum: Object.values(FirstDayOfTheWeek),
    },
    timeZone: {
      description:
        'IANA timezone for date groupings (e.g. "America/New_York"). Default: UTC.',
      default: 'UTC',
      type: 'string',
    },
  },
  additionalProperties: false,
};

const buildSingleKeyObject = ({
  key,
  value,
}: {
  key: string;
  value: JSONSchema7;
}): JSONSchema7 =>
  buildObjectJsonSchema({
    properties: { [key]: value },
    required: [key],
    isStrict: true,
  });

const buildGroupByEntries = ({
  objectMetadata,
  restrictedFields,
  definitions,
}: {
  objectMetadata: Pick<ObjectMetadataForToolSchema, 'fields'>;
  restrictedFields?: RestrictedFieldsPermissions;
  definitions: JsonSchemaDefinitions;
}): { schema: JSONSchema7; label: string }[] =>
  objectMetadata.fields
    .filter(
      (field) =>
        restrictedFields?.[field.id]?.canRead !== false &&
        isFieldMetadataSupportedInGroupBy(field),
    )
    .flatMap((field) => {
      if (isMorphOrRelationFlatFieldMetadata(field)) {
        if (!isManyToOneFlatFieldMetadata(field)) {
          return [];
        }

        const joinColumnName = computeMorphOrRelationFieldJoinColumnName({
          name: field.name,
        });

        return [
          {
            schema: buildSingleKeyObject({
              key: joinColumnName,
              value: TRUE_JSON_SCHEMA,
            }),
            label: joinColumnName,
          },
        ];
      }

      if (isFieldMetadataDateKind(field.type)) {
        return [
          {
            schema: buildSingleKeyObject({
              key: field.name,
              value: referenceJsonSchemaDefinition({
                definitions,
                name: 'DateGroupBy',
                schema: DATE_GROUP_BY_JSON_SCHEMA,
              }),
            }),
            label: `${field.name} (date)`,
          },
        ];
      }

      if (isCompositeFieldMetadataType(field.type)) {
        return (getGroupableSubFieldsForCompositeType(field.type) ?? []).map(
          (subField) => ({
            schema: buildSingleKeyObject({
              key: field.name,
              value: buildSingleKeyObject({
                key: subField,
                value: TRUE_JSON_SCHEMA,
              }),
            }),
            label: `${field.name}.${subField}`,
          }),
        );
      }

      if (isFieldMetadataArrayKind(field.type)) {
        return [
          {
            schema: buildSingleKeyObject({
              key: field.name,
              value: {
                anyOf: [
                  TRUE_JSON_SCHEMA,
                  buildSingleKeyObject({
                    key: 'unnest',
                    value: TRUE_JSON_SCHEMA,
                  }),
                ],
              },
            }),
            label: `${field.name} (multi-value, {"${field.name}": {"unnest": true}} counts each value)`,
          },
        ];
      }

      return [
        {
          schema: buildSingleKeyObject({
            key: field.name,
            value: TRUE_JSON_SCHEMA,
          }),
          label: field.name,
        },
      ];
    });

export const generateGroupByToolInputSchema = ({
  objectMetadata,
  restrictedFields,
}: {
  objectMetadata: Pick<ObjectMetadataForToolSchema, 'fields'>;
  restrictedFields?: RestrictedFieldsPermissions;
}): JSONSchema7 | null => {
  const definitions: JsonSchemaDefinitions = {};

  const groupByEntries = buildGroupByEntries({
    objectMetadata,
    restrictedFields,
    definitions,
  });

  if (groupByEntries.length === 0) {
    return null;
  }

  const { properties: filterProperties } = generateRecordFilterJsonSchema({
    objectMetadata,
    restrictedFields,
    definitions,
  });

  const availableAggregations = getAvailableAggregationsFromObjectFields(
    objectMetadata.fields.filter(
      (field) => restrictedFields?.[field.id]?.canRead !== false,
    ),
  );

  const availableAggregateFieldNames = Array.from(
    new Set(
      Object.values(availableAggregations)
        .filter(
          (aggregation) =>
            aggregation.aggregateOperation !== AggregateOperations.COUNT,
        )
        .map((aggregation) =>
          aggregation.subFieldForNumericOperation
            ? `${aggregation.fromField}.${aggregation.subFieldForNumericOperation}`
            : aggregation.fromField,
        ),
    ),
  );

  const groupByEntrySchemas = groupByEntries.map(({ schema }) => schema);

  return buildObjectJsonSchema({
    properties: {
      groupBy: {
        description: `Fields to group by (max 2). Each entry must be an object with exactly one field key. At most one entry can use unnest. A record with several values is counted in each group, so totals can exceed the record count. Examples: {"status": true}, {"companyId": true}, {"createdAt": {"granularity": "MONTH", "timeZone": "UTC"}}. Available: ${groupByEntries.map(({ label }) => label).join(', ')}.`,
        minItems: 1,
        maxItems: 2,
        type: 'array',
        items:
          groupByEntrySchemas.length === 1
            ? groupByEntrySchemas[0]
            : { anyOf: groupByEntrySchemas },
      },
      aggregateOperation: {
        description:
          'Aggregate operation to apply per group. Default: COUNT. Any operation other than COUNT requires aggregateFieldName.',
        default: AggregateOperations.COUNT,
        type: 'string',
        enum: Object.keys(AggregateOperations),
      },
      aggregateFieldName: {
        description: `Field to aggregate. Required for any operation other than COUNT. Available fields: ${availableAggregateFieldNames.join(', ')}.`,
        type: 'string',
      },
      limit: {
        description:
          'Maximum number of groups to return (default: 50, max: 100).',
        default: 50,
        type: 'integer',
        exclusiveMinimum: 0,
      },
      orderBy: {
        description:
          'Order groups by aggregate value. DESC (default) gives "top N" behavior.',
        default: 'DESC',
        type: 'string',
        enum: ['ASC', 'DESC'],
      },
      ...filterProperties,
    },
    required: ['groupBy'],
    definitions,
    isStrict: true,
  });
};
