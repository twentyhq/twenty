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

  it('should throw when cursor is used instead of starting_after', () => {
    const request: any = { query: { cursor: 'uuid' } };

    expect(() => parseStartingAfterRestRequest(request)).toThrow(
      RestInputRequestParserException,
    );
    expect(() => parseStartingAfterRestRequest(request)).toThrow(
      "'cursor' is not a valid query parameter. Use 'starting_after' for forward pagination or 'ending_before' for backward pagination.",
    );
  });

  it('should throw when after is used instead of starting_after', () => {
    const request: any = { query: { after: 'uuid' } };

    expect(() => parseStartingAfterRestRequest(request)).toThrow(
      RestInputRequestParserException,
    );
  });

  it('should throw when last_cursor is used instead of starting_after', () => {
    const request: any = { query: { last_cursor: 'uuid' } };

    expect(() => parseStartingAfterRestRequest(request)).toThrow(
      RestInputRequestParserException,
    );
  });

  it('should not throw when starting_after is provided alongside an alias', () => {
    const request: any = {
      query: { starting_after: 'uuid', cursor: 'other' },
    };

    expect(parseStartingAfterRestRequest(request)).toEqual('uuid');
  });
});
