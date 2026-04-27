import { RestInputRequestParserException } from 'src/engine/api/rest/input-request-parsers/rest-input-request-parser.exception';

import { parseEndingBeforeRestRequest } from 'src/engine/api/rest/input-request-parsers/ending-before-parser-utils/parse-ending-before-rest-request.util';

describe('parseEndingBeforeRestRequest', () => {
  it('should return undefined if ending_before missing', () => {
    const request: any = { query: {} };

    expect(parseEndingBeforeRestRequest(request)).toEqual(undefined);
  });

  it('should return ending_before', () => {
    const request: any = { query: { ending_before: 'uuid' } };

    expect(parseEndingBeforeRestRequest(request)).toEqual('uuid');
  });

  it('should throw when before alias is used', () => {
    const request: any = { query: { before: 'uuid' } };

    expect(() => parseEndingBeforeRestRequest(request)).toThrow(
      RestInputRequestParserException,
    );
  });

  it('should throw when endingBefore alias is used', () => {
    const request: any = { query: { endingBefore: 'uuid' } };

    expect(() => parseEndingBeforeRestRequest(request)).toThrow(
      RestInputRequestParserException,
    );
  });

  it('should throw when ending alias is used', () => {
    const request: any = { query: { ending: 'uuid' } };

    expect(() => parseEndingBeforeRestRequest(request)).toThrow(
      RestInputRequestParserException,
    );
  });

  it('should throw when endCursor alias is used', () => {
    const request: any = { query: { endCursor: 'uuid' } };

    expect(() => parseEndingBeforeRestRequest(request)).toThrow(
      RestInputRequestParserException,
    );
  });

  it('should throw when cursor alias is used', () => {
    const request: any = { query: { cursor: 'uuid' } };

    expect(() => parseEndingBeforeRestRequest(request)).toThrow(
      RestInputRequestParserException,
    );
  });

  it('should not throw for unrelated query params', () => {
    const request: any = { query: { limit: 10, filter: 'name[eq]:test' } };

    expect(parseEndingBeforeRestRequest(request)).toEqual(undefined);
  });

  it('should throw when ending_before is an array', () => {
    const request: any = { query: { ending_before: ['uuid1', 'uuid2'] } };

    expect(() => parseEndingBeforeRestRequest(request)).toThrow(
      RestInputRequestParserException,
    );
  });

  it('should throw when ending_before is a number', () => {
    const request: any = { query: { ending_before: 123 } };

    expect(() => parseEndingBeforeRestRequest(request)).toThrow(
      RestInputRequestParserException,
    );
  });

  it('should throw when cursor alias is an array', () => {
    const request: any = { query: { cursor: ['uuid1', 'uuid2'] } };

    expect(() => parseEndingBeforeRestRequest(request)).toThrow(
      RestInputRequestParserException,
    );
  });

  it('should throw when cursor alias is a number', () => {
    const request: any = { query: { cursor: 123 } };

    expect(() => parseEndingBeforeRestRequest(request)).toThrow(
      RestInputRequestParserException,
    );
  });
});
