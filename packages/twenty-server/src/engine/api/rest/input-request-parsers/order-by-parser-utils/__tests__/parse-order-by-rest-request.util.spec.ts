import { OrderByDirection } from 'twenty-shared/types';

import { parseOrderByRestRequest } from 'src/engine/api/rest/input-request-parsers/order-by-parser-utils/parse-order-by-rest-request.util';

describe('parseOrderByRestRequest', () => {
  it('should return default if order by missing', () => {
    const request: any = { query: {} };

    expect(parseOrderByRestRequest(request)).toEqual([
      {},
      { id: OrderByDirection.AscNullsFirst },
    ]);
  });

  it('should create order by parser properly', () => {
    const request: any = {
      query: {
        order_by: 'fieldNumber[AscNullsFirst],fieldText[DescNullsLast]',
      },
    };

    expect(parseOrderByRestRequest(request)).toEqual([
      { fieldNumber: OrderByDirection.AscNullsFirst },
      { fieldText: OrderByDirection.DescNullsLast },
      { id: OrderByDirection.AscNullsFirst },
    ]);
  });

  it('should choose default direction if missing', () => {
    const request: any = {
      query: {
        order_by: 'fieldNumber',
      },
    };

    expect(parseOrderByRestRequest(request)).toEqual([
      { fieldNumber: OrderByDirection.AscNullsFirst },
      { id: OrderByDirection.AscNullsFirst },
    ]);
  });

  it('should handle complex fields', () => {
    const request: any = {
      query: {
        order_by: 'fieldCurrency.amountMicros',
      },
    };

    expect(parseOrderByRestRequest(request)).toEqual([
      { fieldCurrency: { amountMicros: OrderByDirection.AscNullsFirst } },
      { id: OrderByDirection.AscNullsFirst },
    ]);
  });

  it('should handle complex fields with direction', () => {
    const request: any = {
      query: {
        order_by: 'fieldCurrency.amountMicros[DescNullsLast]',
      },
    };

    expect(parseOrderByRestRequest(request)).toEqual([
      { fieldCurrency: { amountMicros: OrderByDirection.DescNullsLast } },
      { id: OrderByDirection.AscNullsFirst },
    ]);
  });

  it('should handle multiple complex fields with direction', () => {
    const request: any = {
      query: {
        order_by:
          'fieldCurrency.amountMicros[DescNullsLast],fieldText.label[AscNullsLast]',
      },
    };

    expect(parseOrderByRestRequest(request)).toEqual([
      { fieldCurrency: { amountMicros: OrderByDirection.DescNullsLast } },
      { fieldText: { label: OrderByDirection.AscNullsLast } },
      { id: OrderByDirection.AscNullsFirst },
    ]);
  });

  it('should throw if direction invalid', () => {
    const request: any = {
      query: {
        order_by: 'fieldText[invalid]',
      },
    };

    expect(() => parseOrderByRestRequest(request)).toThrow(
      "'order_by' direction 'invalid' invalid. Allowed values are 'AscNullsFirst', 'AscNullsLast', 'DescNullsFirst', 'DescNullsLast'. eg: ?order_by=field_1[AscNullsFirst],field_2[DescNullsLast],field_3",
    );
  });
});
