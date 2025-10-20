import { BadRequestException } from '@nestjs/common';

import { parseAggregateFieldsRestRequest } from 'src/engine/api/rest/input-request-parsers/aggregate-fields-parser-utils/parse-aggregate-fields-rest-request.util';

describe('parseAggregateFieldsRestRequest', () => {
  it('should parse single aggregate field', () => {
    const request: any = {
      query: { aggregate: '["countNotEmptyId"]' },
    };

    expect(parseAggregateFieldsRestRequest(request)).toEqual({
      countNotEmptyId: true,
    });
  });

  it('should parse multiple aggregate fields', () => {
    const request: any = {
      query: {
        aggregate: '["countNotEmptyId", "countEmptyId"]',
      },
    };

    expect(parseAggregateFieldsRestRequest(request)).toEqual({
      countNotEmptyId: true,
      countEmptyId: true,
    });
  });

  it('should parse empty array', () => {
    const request: any = {
      query: { aggregate: '[]' },
    };

    expect(parseAggregateFieldsRestRequest(request)).toEqual({});
  });

  it('should throw if aggregate parameter is not a string', () => {
    const request: any = {
      query: { aggregate: ['countNotEmptyId'] },
    };

    expect(() => parseAggregateFieldsRestRequest(request)).toThrow(
      BadRequestException,
    );
    expect(() => parseAggregateFieldsRestRequest(request)).toThrow(
      'Invalid aggregate query parameter - should be a valid array of string - ex: ["countNotEmptyId", "countEmptyField_1"]',
    );
  });

  it('should throw if aggregate parameter is not valid JSON', () => {
    const request: any = {
      query: { aggregate: 'not-valid-json' },
    };

    expect(() => parseAggregateFieldsRestRequest(request)).toThrow(
      BadRequestException,
    );
    expect(() => parseAggregateFieldsRestRequest(request)).toThrow(
      'Invalid aggregate query parameter - should be a valid array of string - ex: ["countNotEmptyId", "countEmptyField_1"]',
    );
  });

  it('should throw if aggregate parameter is undefined', () => {
    const request: any = {
      query: {},
    };

    expect(() => parseAggregateFieldsRestRequest(request)).toThrow(
      BadRequestException,
    );
    expect(() => parseAggregateFieldsRestRequest(request)).toThrow(
      'Invalid aggregate query parameter - should be a valid array of string - ex: ["countNotEmptyId", "countEmptyField_1"]',
    );
  });
});
