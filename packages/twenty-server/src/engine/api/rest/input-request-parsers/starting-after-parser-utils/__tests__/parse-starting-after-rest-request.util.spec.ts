import { RestInputRequestParserException } from 'src/engine/api/rest/input-request-parsers/rest-input-request-parser.exception';

import { parseStartingAfterRestRequest } from 'src/engine/api/rest/input-request-parsers/starting-after-parser-utils/parse-starting-after-rest-request.util';

describe('parseStartingAfterRestRequest', () => {
  it('should return undefined if starting_after missing', () => {
    const request: any = { query: {} };

    expect(parseStartingAfterRestRequest(request)).toEqual(undefined);
  });

  it('should return starting_after', () => {
    const request: any = { query: { starting_after: 'uuid' } };

    expect(parseStartingAfterRestRequest(request)).toEqual('uuid');
  });

  it('should throw when cursor alias is used', () => {
    const request: any = { query: { cursor: 'uuid' } };

    expect(() => parseStartingAfterRestRequest(request)).toThrow(
      RestInputRequestParserException,
    );
  });

  it('should throw when after alias is used', () => {
    const request: any = { query: { after: 'uuid' } };

    expect(() => parseStartingAfterRestRequest(request)).toThrow(
      RestInputRequestParserException,
    );
  });

  it('should throw when lastCursor alias is used', () => {
    const request: any = { query: { lastCursor: 'uuid' } };

    expect(() => parseStartingAfterRestRequest(request)).toThrow(
      RestInputRequestParserException,
    );
  });

  it('should throw when page_token alias is used', () => {
    const request: any = { query: { page_token: 'uuid' } };

    expect(() => parseStartingAfterRestRequest(request)).toThrow(
      RestInputRequestParserException,
    );
  });

  it('should not throw for unrelated query params', () => {
    const request: any = { query: { limit: 10, filter: 'name[eq]:test' } };

    expect(parseStartingAfterRestRequest(request)).toEqual(undefined);
  });

  it('should throw when starting_after is an array', () => {
    const request: any = { query: { starting_after: ['uuid1', 'uuid2'] } };

    expect(() => parseStartingAfterRestRequest(request)).toThrow(
      RestInputRequestParserException,
    );
  });

  it('should throw when starting_after is a number', () => {
    const request: any = { query: { starting_after: 123 } };

    expect(() => parseStartingAfterRestRequest(request)).toThrow(
      RestInputRequestParserException,
    );
  });

  it('should throw when cursor alias is an array', () => {
    const request: any = { query: { cursor: ['uuid1', 'uuid2'] } };

    expect(() => parseStartingAfterRestRequest(request)).toThrow(
      RestInputRequestParserException,
    );
  });

  it('should throw when cursor alias is a number', () => {
    const request: any = { query: { cursor: 123 } };

    expect(() => parseStartingAfterRestRequest(request)).toThrow(
      RestInputRequestParserException,
    );
  });
});
