import { OrderByDirection } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';

import {
  computeDepthParameters,
  computeFilterParameters,
  computeIdPathParameter,
  computeLastCursorParameters,
  computeLimitParameters,
  computeOrderByParameters,
} from 'src/engine/core-modules/open-api/utils/parameters.utils';
import { DEFAULT_ORDER_DIRECTION } from 'src/engine/api/rest/api-rest-query-builder/factories/input-factories/order-by-input.factory';
import { FilterComparators } from 'src/engine/api/rest/api-rest-query-builder/factories/input-factories/filter-utils/parse-base-filter.utils';
import { Conjunctions } from 'src/engine/api/rest/api-rest-query-builder/factories/input-factories/filter-utils/parse-filter.utils';
import { DEFAULT_CONJUNCTION } from 'src/engine/api/rest/api-rest-query-builder/factories/input-factories/filter-utils/add-default-conjunction.utils';

describe('computeParameters', () => {
  describe('computeLimit', () => {
    it('should compute limit', () => {
      expect(computeLimitParameters()).toEqual({
        name: 'limit',
        in: 'query',
        description: 'Limits the number of objects returned.',
        required: false,
        schema: {
          type: 'integer',
          minimum: 0,
          maximum: 60,
          default: 60,
        },
      });
    });
  });
  describe('computeOrderBy', () => {
    it('should compute order by', () => {
      expect(computeOrderByParameters()).toEqual({
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
            value: 'createdAt',
            summary: 'A simple order_by param',
          },
          complex: {
            value: `id[${OrderByDirection.AscNullsFirst}],createdAt[${OrderByDirection.DescNullsLast}]`,
            summary: 'A more complex order_by param',
          },
        },
      });
    });
  });
  describe('computeDepth', () => {
    it('should compute depth', () => {
      expect(computeDepthParameters()).toEqual({
        name: 'depth',
        in: 'query',
        description: 'Limits the depth objects returned.',
        required: false,
        schema: {
          type: 'integer',
          enum: [1, 2],
        },
      });
    });
  });
  describe('computeFilter', () => {
    it('should compute filters', () => {
      expect(computeFilterParameters()).toEqual({
        name: 'filter',
        in: 'query',
        description: `Filters objects returned.  
    Should have the following shape: **field_1[COMPARATOR]:value_1,field_2[COMPARATOR]:value_2,...**  
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
          complex: {
            value:
              'or(createdAt[gte]:"2024-01-01",createdAt[lte]:"2023-01-01",not(id[is]:NULL))',
            description: 'A more complex filter param',
          },
        },
      });
    });
  });
  describe('computeLastCursor', () => {
    it('should compute last cursor', () => {
      expect(computeLastCursorParameters()).toEqual({
        name: 'last_cursor',
        in: 'query',
        description: 'Returns objects starting from a specific cursor.',
        required: false,
        schema: {
          type: 'string',
        },
      });
    });
  });
  describe('computeIdPathParameter', () => {
    it('should compute id path param', () => {
      expect(computeIdPathParameter()).toEqual({
        name: 'id',
        in: 'path',
        description: 'Object id.',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid',
        },
      });
    });
  });
});
