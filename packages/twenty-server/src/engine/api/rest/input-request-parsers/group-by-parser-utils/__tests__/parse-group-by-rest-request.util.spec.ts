import { BadRequestException } from '@nestjs/common';

import { parseGroupByRestRequest } from 'src/engine/api/rest/input-request-parsers/group-by-parser-utils/parse-group-by-rest-request.util';

describe('parseGroupByRestRequest', () => {
  it('should parse mixed field types', () => {
    const request: any = {
      query: {
        group_by:
          '[{"field_1": true}, {"fieldCurrency": {"amountMicros": true}}, {"createdAt": {"granularity": "WEEK"}}]',
      },
    };

    expect(parseGroupByRestRequest(request)).toEqual([
      { field_1: true },
      { fieldCurrency: { amountMicros: true } },
      { createdAt: { granularity: 'WEEK' } },
    ]);
  });

  it('should parse empty array', () => {
    const request: any = {
      query: { group_by: '[]' },
    };

    expect(parseGroupByRestRequest(request)).toEqual([]);
  });

  it('should throw if group_by parameter is not a string', () => {
    const request: any = {
      query: { group_by: [{ field_1: true }] },
    };

    expect(() => parseGroupByRestRequest(request)).toThrow(BadRequestException);
    expect(() => parseGroupByRestRequest(request)).toThrow(
      `Invalid group_by query parameter - should be a valid array of objects - ex: [{"field_2": true}, {"field_3": {"subField": true}}, {"dateField": {"granularity": 'DAY'}}]`,
    );
  });

  it('should throw if group_by parameter is not valid JSON', () => {
    const request: any = {
      query: { group_by: 'not-valid-json' },
    };

    expect(() => parseGroupByRestRequest(request)).toThrow(BadRequestException);
    expect(() => parseGroupByRestRequest(request)).toThrow(
      `Invalid group_by query parameter - should be a valid array of objects - ex: [{"field_2": true}, {"field_3": {"subField": true}}, {"dateField": {"granularity": 'DAY'}}]`,
    );
  });

  it('should throw if group_by parameter is undefined', () => {
    const request: any = {
      query: {},
    };

    expect(() => parseGroupByRestRequest(request)).toThrow(BadRequestException);
    expect(() => parseGroupByRestRequest(request)).toThrow(
      `Invalid group_by query parameter - should be a valid array of objects - ex: [{"field_2": true}, {"field_3": {"subField": true}}, {"dateField": {"granularity": 'DAY'}}]`,
    );
  });
});
