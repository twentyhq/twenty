import { OpenAPIV3_1 } from 'openapi-types';

import { OrderByDirection } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { DEFAULT_CONJUNCTION } from 'src/engine/api/rest/core/query-builder/utils/filter-utils/add-default-conjunction.utils';
import { FilterComparators } from 'src/engine/api/rest/core/query-builder/utils/filter-utils/parse-base-filter.utils';
import { Conjunctions } from 'src/engine/api/rest/core/query-builder/utils/filter-utils/parse-filter.utils';
import { DEFAULT_ORDER_DIRECTION } from 'src/engine/api/rest/input-factories/order-by-input.factory';

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
      maximum: fromMetadata ? 1000 : 60,
      default: fromMetadata ? 1000 : 60,
    },
  };
};

export const computeOrderByParameters = (): OpenAPIV3_1.ParameterObject => {
  return {
    name: 'order_by',
    in: 'query',
    description: `Sorts objects returned.  
    Should have the following shape: **field_name_1,field_name_2[DIRECTION_2],...**  
    Available directions are **${Object.values(OrderByDirection).join(
      '**, **',
    )}**.  
    Default direction is **${DEFAULT_ORDER_DIRECTION}**`,
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
    - 0: Returns only the primary object's information.  
    - 1: Returns the primary object along with its directly related objects (with no additional nesting for related objects).  
    - 2: Returns the primary object, its directly related objects, and the related objects of those related objects.`,
    required: false,
    schema: {
      type: 'integer',
      enum: [0, 1, 2],
      default: 1,
    },
  };
};

export const computeFilterParameters = (): OpenAPIV3_1.ParameterObject => {
  return {
    name: 'filter',
    in: 'query',
    description: `Filters objects returned.  
    Should have the following shape: **field_1[COMPARATOR]:value_1,field_2[COMPARATOR]:value_2...
    To filter on composite type fields use **field.subField[COMPARATOR]:value_1
    **
    Available comparators are **${Object.values(FilterComparators).join(
      '**, **',
    )}**.  
    You can create more complex filters using conjunctions **${Object.values(
      Conjunctions,
    ).join('**, **')}**.  
    Default root conjunction is **${DEFAULT_CONJUNCTION}**.  
    To filter **null** values use **field[is]:NULL** or **field[is]:NOT_NULL**  
    To filter using **boolean** values use **field[eq]:true** or **field[eq]:false**`,

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
