import {
  QUERY_DEFAULT_LIMIT_RECORDS,
  QUERY_MAX_RECORDS,
} from 'twenty-shared/constants';
import { OrderByDirection } from 'twenty-shared/types';

import {
  computeDepthParameters,
  computeEndingBeforeParameters,
  computeFilterParameters,
  computeIdPathParameter,
  computeLimitParameters,
  computeOrderByParameters,
  computeStartingAfterParameters,
} from 'src/engine/core-modules/open-api/utils/parameters.utils';

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
          maximum: QUERY_MAX_RECORDS,
          default: QUERY_DEFAULT_LIMIT_RECORDS,
        },
      });
    });
  });
  describe('computeOrderBy', () => {
    it('should compute order by', () => {
      expect(computeOrderByParameters()).toEqual({
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
        description: `Determines the level of nested related objects to include in the response.  
    - 0: Primary object only  
    - 1: Primary object + direct relations`,
        required: false,
        schema: {
          type: 'integer',
          enum: [0, 1],
          default: 1,
        },
      });
    });
  });
  describe('computeFilter', () => {
    it('should compute filters', () => {
      expect(computeFilterParameters()).toEqual({
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
      });
    });
  });
  describe('computeStartingAfter', () => {
    it('should compute starting after', () => {
      expect(computeStartingAfterParameters()).toEqual({
        name: 'starting_after',
        in: 'query',
        description:
          'Returns objects starting after a specific cursor. You can find cursors in **startCursor** and **endCursor** in **pageInfo** in response data',
        required: false,
        schema: {
          type: 'string',
        },
      });
    });
  });
  describe('computeEndingBefore', () => {
    it('should compute ending_before', () => {
      expect(computeEndingBeforeParameters()).toEqual({
        name: 'ending_before',
        in: 'query',
        description:
          'Returns objects ending before a specific cursor. You can find cursors in **startCursor** and **endCursor** in **pageInfo** in response data',
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
