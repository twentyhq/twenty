import { OrderByDirection } from 'src/workspace/workspace-query-builder/interfaces/record.interface';

import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { FilterComparators } from 'src/core/api-rest/api-rest-query-builder/factories/input-factories/filter-utils/parse-base-filter.utils';
import { Conjunctions } from 'src/core/api-rest/api-rest-query-builder/factories/input-factories/filter-utils/parse-filter.utils';
import { capitalize } from 'src/utils/capitalize';
import { DEFAULT_ORDER_DIRECTION } from 'src/core/api-rest/api-rest-query-builder/factories/input-factories/order-by-input.factory';
import { DEFAULT_CONJUNCTION } from 'src/core/api-rest/api-rest-query-builder/factories/input-factories/filter-utils/add-default-conjunction.utils';

export const computeLimitParameters = (item: ObjectMetadataEntity) => {
  return {
    name: 'limit',
    in: 'query',
    description: `Integer value to limit the number of **${item.namePlural}** returned`,
    required: false,
    schema: {
      type: 'integer',
      minimum: 0,
      maximum: 60,
      default: 60,
    },
  };
};

export const computeOrderByParameters = (item: ObjectMetadataEntity) => {
  return {
    name: 'order_by',
    in: 'query',
    description: `A combination of fields and directions to sort **${
      item.namePlural
    }** returned.  
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
        value: `name,createdAt`,
        summary: 'A simple order_by param',
      },
      complex: {
        value: `name[${OrderByDirection.AscNullsFirst}],createdAt[${OrderByDirection.DescNullsLast}]`,
        summary: 'A more complex order_by param',
      },
    },
  };
};

export const computeDepthParameters = (item: ObjectMetadataEntity) => {
  return {
    name: 'depth',
    in: 'query',
    description: `Integer value to limit the depth of related objects of **${item.namePlural}** returned`,
    required: false,
    schema: {
      type: 'integer',
      enum: [1, 2],
    },
  };
};

export const computeFilterParameters = (item: ObjectMetadataEntity) => {
  return {
    name: 'filter',
    in: 'query',
    description: `A combination of fields, filter operations and values to filter **${
      item.namePlural
    }** returned.  
    Should have the following shape: **field_1[COMPARATOR]:value_1,field_2[COMPARATOR]:value_2,...**  
    Available comparators are **${Object.values(FilterComparators).join(
      '**, **',
    )}**.  
    You can create more complex filters using conjunctions **${Object.values(
      Conjunctions,
    ).join('**, **')}**.  
    Default conjunction is **${DEFAULT_CONJUNCTION}**.  
    To filter **null** values use **field[is]:NULL** or **field[is]:NOT_NULL**  
    To filter using **boolean** values use **field[eq]:true** or **field[eq]:false**`,
    required: false,
    schema: {
      type: 'string',
    },
    examples: {
      simple: {
        value: `name[eq]:"Airbnb"`,
        description: 'A simple filter param',
      },
      complex: {
        value: `or(name[eq]:"Airbnb",employees[gt]:1,not(name[is]:NULL),not(and(createdAt[lte]:"2022-01-01T00:00:00.000Z",idealCustomerProfile[eq]:true)))`,
        description: 'A more complex filter param',
      },
    },
  };
};

export const computeLastCursorParameters = (item: ObjectMetadataEntity) => {
  return {
    name: 'last_cursor',
    in: 'query',
    description: `Used to return **${item.namePlural}** starting from a specific cursor`,
    required: false,
    schema: {
      type: 'string',
    },
  };
};

export const computeIdPathParameter = (item: ObjectMetadataEntity) => {
  return {
    name: 'id',
    in: 'path',
    description: `${capitalize(item.nameSingular)} id`,
    required: true,
    schema: {
      type: 'string',
      format: 'uuid',
    },
  };
};
