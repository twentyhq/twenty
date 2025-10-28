import { type OpenAPIV3_1 } from 'openapi-types';
import {
  QUERY_DEFAULT_LIMIT_RECORDS,
  QUERY_MAX_RECORDS,
} from 'twenty-shared/constants';
import { OrderByDirection } from 'twenty-shared/types';

export const computeLimitParameters = (
  fromMetadata = false,
): OpenAPIV3_1.ParameterObject => {
  return {
    name: 'limit',
    in: 'query',
    description: 'Limits the number of objects returned.',
    required: false,
    schema: {
      type: 'integer',
      minimum: 0,
      maximum: fromMetadata ? 1000 : QUERY_MAX_RECORDS,
      default: fromMetadata ? 1000 : QUERY_DEFAULT_LIMIT_RECORDS,
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
    description: `Format: field[COMPARATOR]:value,field2[COMPARATOR]:value2  
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
