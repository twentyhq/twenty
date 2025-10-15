import { parseGroupByRestRequest } from 'src/engine/api/rest/input-request-parsers/group-by-parser-utils/parse-group-by-rest-request.util';
import { RestInputRequestParserException } from 'src/engine/api/rest/input-request-parsers/rest-input-request-parser.exception';

describe('parseGroupByRestRequest', () => {
  it('should parse mixed field types', () => {
    const request: any = {
      query: {
        group_by:
          '[{"firstField": true}, {"fieldCurrency": {"amountMicros": true}}, {"createdAt": {"granularity": "WEEK"}}]',
      },
    };

    expect(parseGroupByRestRequest(request)).toEqual([
      { firstField: true },
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
      query: { group_by: [{ firstField: true }] },
    };

    expect(() => parseGroupByRestRequest(request)).toThrow(
      RestInputRequestParserException,
    );
    expect(() => parseGroupByRestRequest(request)).toThrow(
      `Invalid group_by query parameter - should be a valid array of objects - ex: [{"firstField": true}, {"secondField": {"subField": true}}, {"dateField": {"granularity": 'DAY'}}]`,
    );
  });

  it('should throw if group_by parameter is not valid JSON', () => {
    const request: any = {
      query: { group_by: 'not-valid-json' },
    };

    expect(() => parseGroupByRestRequest(request)).toThrow(
      RestInputRequestParserException,
    );
    expect(() => parseGroupByRestRequest(request)).toThrow(
      `Invalid group_by query parameter - should be a valid array of objects - ex: [{"firstField": true}, {"secondField": {"subField": true}}, {"dateField": {"granularity": 'DAY'}}]`,
    );
  });

  it('should throw if group_by parameter is undefined', () => {
    const request: any = {
      query: {},
    };

    expect(() => parseGroupByRestRequest(request)).toThrow(
      RestInputRequestParserException,
    );
    expect(() => parseGroupByRestRequest(request)).toThrow(
      `Invalid group_by query parameter - should be a valid array of objects - ex: [{"firstField": true}, {"secondField": {"subField": true}}, {"dateField": {"granularity": 'DAY'}}]`,
    );
  });
});
