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

  it('should throw when before is used instead of ending_before', () => {
    const request: any = { query: { before: 'uuid' } };

    expect(() => parseEndingBeforeRestRequest(request)).toThrow(
      RestInputRequestParserException,
    );
    expect(() => parseEndingBeforeRestRequest(request)).toThrow(
      "'before' is not a valid query parameter. Use 'ending_before' for backward pagination or 'starting_after' for forward pagination.",
    );
  });

  it('should not throw when ending_before is provided alongside an alias', () => {
    const request: any = {
      query: { ending_before: 'uuid', before: 'other' },
    };

    expect(parseEndingBeforeRestRequest(request)).toEqual('uuid');
  });
});
