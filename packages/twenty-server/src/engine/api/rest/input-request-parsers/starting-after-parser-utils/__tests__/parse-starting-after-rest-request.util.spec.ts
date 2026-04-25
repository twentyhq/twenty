import { RestInputRequestParserExceptionCode } from 'src/engine/api/rest/input-request-parsers/rest-input-request-parser.exception';
import { parseStartingAfterRestRequest } from 'src/engine/api/rest/input-request-parsers/starting-after-parser-utils/parse-starting-after-rest-request.util';

describe('parseStartingAfterRestRequest', () => {
  it('should return default if starting_after missing', () => {
    const request: any = { query: {} };

    expect(parseStartingAfterRestRequest(request)).toEqual(undefined);
  });

  it('should return starting_after', () => {
    const request: any = { query: { starting_after: 'uuid' } };

    expect(parseStartingAfterRestRequest(request)).toEqual('uuid');
  });

  it('should throw when using wrong pagination parameter name', () => {
    const wrongNames = [
      'cursor',
      'after',
      'lastCursor',
      'last_cursor',
      'startingAfter',
      'page_token',
    ];

    for (const wrongName of wrongNames) {
      const request: any = { query: { [wrongName]: 'some-cursor' } };

      expect(() => parseStartingAfterRestRequest(request)).toThrow(
        expect.objectContaining({
          code: RestInputRequestParserExceptionCode.INVALID_CURSOR_QUERY_PARAM,
        }),
      );
    }
  });

  it('should not throw for wrong names when starting_after is also provided', () => {
    const request: any = {
      query: { starting_after: 'uuid', cursor: 'ignored' },
    };

    expect(parseStartingAfterRestRequest(request)).toEqual('uuid');
  });
});
