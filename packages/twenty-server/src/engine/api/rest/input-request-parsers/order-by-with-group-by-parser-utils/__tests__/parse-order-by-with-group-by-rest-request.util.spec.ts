import { BadRequestException } from '@nestjs/common';

import { parseOrderByWithGroupByRestRequest } from 'src/engine/api/rest/input-request-parsers/order-by-with-group-by-parser-utils/parse-order-by-with-group-by-rest-request.util';

describe('parseOrderByWithGroupByRestRequest', () => {
  it('should parse mixed order by types', () => {
    const request: any = {
      query: {
        order_by:
          '[{"field_1": "AscNullsFirst"}, {"fieldCurrency": {"amountMicros": "DescNullsLast"}}, {"aggregate": {"countNotEmptyId": "AscNullsFirst"}}, {"createdAt": {"orderBy": "DescNullsLast", "granularity": "WEEK"}}]',
      },
    };

    expect(parseOrderByWithGroupByRestRequest(request)).toEqual([
      { field_1: 'AscNullsFirst' },
      { fieldCurrency: { amountMicros: 'DescNullsLast' } },
      { aggregate: { countNotEmptyId: 'AscNullsFirst' } },
      { createdAt: { orderBy: 'DescNullsLast', granularity: 'WEEK' } },
    ]);
  });

  it('should parse empty array', () => {
    const request: any = {
      query: { order_by: '[]' },
    };

    expect(parseOrderByWithGroupByRestRequest(request)).toEqual([]);
  });

  it('should return undefined if order_by parameter is undefined', () => {
    const request: any = {
      query: {},
    };

    expect(parseOrderByWithGroupByRestRequest(request)).toBeUndefined();
  });

  it('should throw if order_by parameter is not valid JSON', () => {
    const request: any = {
      query: { order_by: 'not-valid-json' },
    };

    expect(() => parseOrderByWithGroupByRestRequest(request)).toThrow(
      BadRequestException,
    );
    expect(() => parseOrderByWithGroupByRestRequest(request)).toThrow(
      `Invalid order_by query parameter - should be a valid array of objects - ex: [{"firstField": "AscNullsFirst"}, {"secondField": {"subField": "DescNullsLast"}}, {"aggregate": {"aggregateField": "DescNullsLast"}}, {dateField: {"orderBy": "AscNullsFirst", "granularity": "DAY"}}]`,
    );
  });
});
