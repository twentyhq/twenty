import { type OpenAPIV3_1 } from 'openapi-types';
import {
  QUERY_DEFAULT_LIMIT_RECORDS,
  QUERY_MAX_RECORDS,
} from 'twenty-shared/constants';
import { OrderByDirection } from 'twenty-shared/types';

import { REST_API_DEFAULT_MAX_FIELDS } from 'src/engine/api/rest/input-request-parsers/constants/rest-api-default-max-fields.constant';

export const computeLimitParameters = (): OpenAPIV3_1.ParameterObject => {
  return {
    name: 'limit',
    in: 'query',
    description: 'Limits the number of objects returned.',
    required: false,
    schema: {
      type: 'integer',
      minimum: 0,
      maximum: QUERY_MAX_RECORDS,
      default: QUERY_DEFAULT_LIMIT_RECORDS,
    },
  };
};

export const computeOrderByParameters = (): OpenAPIV3_1.ParameterObject => {
  return {
    name: 'order_by',
    in: 'query',
    description: `Format: **field_name_1,field_name_2[DIRECTION_2]
    Refer to the filter section at the top of the page for more details.`,
    required: false,
    schema: {
      type: 'string',
    },
    examples: {
      simple: {
        value: `createdAt`,
        summary: 'A simple order_by param',
      },
      complex: {
        value: `id[${OrderByDirection.AscNullsFirst}],createdAt[${OrderByDirection.DescNullsLast}]`,
        summary: 'A more complex order_by param',
      },
    },
  };
};

export const computeDepthParameters = (): OpenAPIV3_1.ParameterObject => {
  return {
    name: 'depth',
    in: 'query',
    description: `Determines the level of nested related objects to include in the response.
    - 0: Primary object only
    - 1: Primary object + direct relations`,
    required: false,
    schema: {
      type: 'integer',
      enum: [0, 1],
      default: 1,
    },
  };
};

export const computeDiscoverParameters = (): OpenAPIV3_1.ParameterObject => {
  return {
    name: 'discover',
    in: 'query',
    description:
      'If true, returns every record your role can read, including those not shared with you, but only with the fields that tell a record exists. Other fields cannot be selected, filtered or sorted on.',
    required: false,
    schema: {
      type: 'boolean',
      default: false,
    },
  };
};

export const computeFieldsParameters = (): OpenAPIV3_1.ParameterObject => {
  return {
    name: 'fields',
    in: 'query',
    description: `Comma-separated list of field names to return, e.g. **id,name,emails,company**.
    - **id** is always returned.
    - Composite fields are selected as a whole by their field name.
    - A many-to-one relation field returns its join column (e.g. **companyId**) with depth=0, and its related record with depth=1. One-to-many relation fields are only returned with depth=1. With depth=1, only the relation fields listed here are expanded.
    - Unknown fields or fields you cannot read return a 400 error.
    When omitted on an object with more than ${REST_API_DEFAULT_MAX_FIELDS} readable fields, a default set of ${REST_API_DEFAULT_MAX_FIELDS} fields is returned for each record: id, label identifier, image identifier, createdAt, updatedAt, deletedAt, position, then standard fields before custom fields, by name. Pass fields explicitly to read any other field.`,
    required: false,
    schema: {
      type: 'string',
    },
    examples: {
      simple: {
        value: 'id,name',
        summary: 'A simple fields param',
      },
      withRelation: {
        value: 'id,name,emails,company',
        summary: 'A fields param with a composite and a relation field',
      },
    },
  };
};

export const computeUpsertParameters = (): OpenAPIV3_1.ParameterObject => {
  return {
    name: 'upsert',
    in: 'query',
    description:
      'If true, creates the object or updates it if it already exists.',
    required: false,
    schema: {
      type: 'boolean',
      default: false,
    },
  };
};

export const computeSoftDeleteParameters = (): OpenAPIV3_1.ParameterObject => {
  return {
    name: 'soft_delete',
    in: 'query',
    description:
      'If true, soft deletes the objects. If false, objects are permanently deleted.',
    required: false,
    schema: {
      type: 'boolean',
      default: false,
    },
  };
};

export const computeFilterParameters = (): OpenAPIV3_1.ParameterObject => {
  return {
    name: 'filter',
    in: 'query',
    description: `Format: field[COMPARATOR]:value,field2[COMPARATOR]:value2.
    For like/ilike, use % as a wildcard (e.g. %value% for substring match).
    Refer to the filter section at the top of the page for more details.`,
    required: false,
    schema: {
      type: 'string',
    },
    examples: {
      simple: {
        value: 'createdAt[gte]:"2023-01-01"',
        description: 'A simple filter param',
      },
      simpleNested: {
        value: 'emails.primaryEmail[eq]:foo99@example.com',
        description: 'A simple composite type filter param',
      },
      complex: {
        value:
          'or(createdAt[gte]:"2024-01-01",createdAt[lte]:"2023-01-01",not(id[is]:NULL))',
        description: 'A more complex filter param',
      },
      like: {
        value: 'name[like]:"%value%"',
        description: 'Pattern matching',
      },
    },
  };
};

export const computeStartingAfterParameters =
  (): OpenAPIV3_1.ParameterObject => {
    return {
      name: 'starting_after',
      in: 'query',
      description:
        'Returns objects starting after a specific cursor. You can find cursors in **startCursor** and **endCursor** in **pageInfo** in response data',
      required: false,
      schema: {
        type: 'string',
      },
    };
  };

export const computeEndingBeforeParameters =
  (): OpenAPIV3_1.ParameterObject => {
    return {
      name: 'ending_before',
      in: 'query',
      description:
        'Returns objects ending before a specific cursor. You can find cursors in **startCursor** and **endCursor** in **pageInfo** in response data',
      required: false,
      schema: {
        type: 'string',
      },
    };
  };

export const computeIdPathParameter = (): OpenAPIV3_1.ParameterObject => {
  return {
    name: 'id',
    in: 'path',
    description: 'Object id.',
    required: true,
    schema: {
      type: 'string',
      format: 'uuid',
    },
  };
};

export const computeGroupByParameters = (): OpenAPIV3_1.ParameterObject => {
  return {
    name: 'group_by',
    in: 'query',
    description: `Array of fields to group by. Each element can specify a field and optionally a subfield or granularity for date fields.`,
    required: true,
    schema: {
      type: 'string',
    },
    examples: {
      simple: {
        value: '[{"updatedAt": true}]',
        summary: 'Group by a single field',
      },
      subfield: {
        value: '[{"assignee": {"name": true}}]',
        summary: 'Group by a relation field subfield',
      },
      dateGranularity: {
        value: '[{"createdAt": {"granularity": "MONTH"}}]',
        summary: 'Group by date with granularity (DAY, WEEK, MONTH, YEAR)',
      },
    },
  };
};

export const computeViewIdParameters = (): OpenAPIV3_1.ParameterObject => {
  return {
    name: 'view_id',
    in: 'query',
    description: 'View ID to apply filters from.',
    required: false,
    schema: {
      type: 'string',
      format: 'uuid',
    },
  };
};

export const computeIncludeRecordsSampleParameters =
  (): OpenAPIV3_1.ParameterObject => {
    return {
      name: 'include_records_sample',
      in: 'query',
      description:
        'If true, includes a sample of records for each group in the response.',
      required: false,
      schema: {
        type: 'boolean',
        default: false,
      },
    };
  };

export const computeAggregateParameters = (): OpenAPIV3_1.ParameterObject => {
  return {
    name: 'aggregate',
    in: 'query',
    description: `Array of aggregate operations to compute for each group.`,
    required: false,
    schema: {
      type: 'string',
    },
    examples: {
      count: {
        value: '["countNotEmptyId"]',
        summary: 'Count non-empty IDs in each group',
      },
      multiple: {
        value: '["countNotEmptyId", "sumAmount"]',
        summary: 'Multiple aggregate operations',
      },
    },
  };
};

export const computeOrderByForRecordsParameters =
  (): OpenAPIV3_1.ParameterObject => {
    return {
      name: 'order_by_for_records',
      in: 'query',
      description: `Order by clause for records within each group. Only applicable when include_records_sample is true.`,
      required: false,
      schema: {
        type: 'string',
      },
      examples: {
        simple: {
          value: 'createdAt',
          summary: 'Order records by createdAt',
        },
      },
    };
  };
