import { OrderByDirection } from 'src/workspace/workspace-query-builder/interfaces/record.interface';

import {
  computeDepthParameters,
  computeFilterParameters,
  computeIdPathParameter,
  computeLastCursorParameters,
  computeLimitParameters,
  computeOrderByParameters,
} from 'src/core/open-api/utils/parameters.utils';
import { objectMetadataItem } from 'src/utils/utils-test/object-metadata-item';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { DEFAULT_ORDER_DIRECTION } from 'src/core/api-rest/api-rest-query-builder/factories/input-factories/order-by-input.factory';
import { FilterComparators } from 'src/core/api-rest/api-rest-query-builder/factories/input-factories/filter-utils/parse-base-filter.utils';
import { Conjunctions } from 'src/core/api-rest/api-rest-query-builder/factories/input-factories/filter-utils/parse-filter.utils';
import { DEFAULT_CONJUNCTION } from 'src/core/api-rest/api-rest-query-builder/factories/input-factories/filter-utils/add-default-conjunction.utils';

describe('computeParameters', () => {
  describe('computeLimit', () => {
    it('should compute limit', () => {
      expect(
        computeLimitParameters(objectMetadataItem as ObjectMetadataEntity),
      ).toEqual({
        name: 'limit',
        in: 'query',
        description:
          'Integer value to limit the number of **objectsName** returned',
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
      expect(
        computeOrderByParameters(objectMetadataItem as ObjectMetadataEntity),
      ).toEqual({
        name: 'order_by',
        in: 'query',
        description: `A combination of fields and directions to sort **objectsName** returned.  
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
      });
    });
  });
  describe('computeDepth', () => {
    it('should compute depth', () => {
      expect(
        computeDepthParameters(objectMetadataItem as ObjectMetadataEntity),
      ).toEqual({
        name: 'depth',
        in: 'query',
        description:
          'Integer value to limit the depth of related objects of **objectsName** returned',
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
      expect(
        computeFilterParameters(objectMetadataItem as ObjectMetadataEntity),
      ).toEqual({
        name: 'filter',
        in: 'query',
        description: `A combination of fields, filter operations and values to filter **objectsName** returned.  
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
      });
    });
  });
  describe('computeLastCursor', () => {
    it('should compute last cursor', () => {
      expect(
        computeLastCursorParameters(objectMetadataItem as ObjectMetadataEntity),
      ).toEqual({
        name: 'last_cursor',
        in: 'query',
        description:
          'Used to return **objectsName** starting from a specific cursor',
        required: false,
        schema: {
          type: 'string',
        },
      });
    });
  });
  describe('computeIdPathParameter', () => {
    it('should compute id path param', () => {
      expect(
        computeIdPathParameter(objectMetadataItem as ObjectMetadataEntity),
      ).toEqual({
        name: 'id',
        in: 'path',
        description: 'ObjectName id',
        required: true,
        schema: {
          type: 'string',
          format: 'uuid',
        },
      });
    });
  });
});
