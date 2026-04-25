import { parseEndingBeforeRestRequest } from 'src/engine/api/rest/input-request-parsers/ending-before-parser-utils/parse-ending-before-rest-request.util';
import { RestInputRequestParserExceptionCode } from 'src/engine/api/rest/input-request-parsers/rest-input-request-parser.exception';

describe('parseEndingBeforeRestRequest', () => {
  it('should return default if ending_before missing', () => {
    const request: any = { query: {} };

    expect(parseEndingBeforeRestRequest(request)).toEqual(undefined);
  });

  it('should return ending_before', () => {
    const request: any = { query: { ending_before: 'uuid' } };

    expect(parseEndingBeforeRestRequest(request)).toEqual('uuid');
  });

  it('should throw when using wrong pagination parameter name', () => {
    const wrongNames = ['before', 'endingBefore', 'ending'];

    for (const wrongName of wrongNames) {
      const request: any = { query: { [wrongName]: 'some-cursor' } };

      expect(() => parseEndingBeforeRestRequest(request)).toThrow(
        expect.objectContaining({
          code: RestInputRequestParserExceptionCode.INVALID_CURSOR_QUERY_PARAM,
        }),
      );
    }
  });

  it('should not throw for wrong names when ending_before is also provided', () => {
    const request: any = {
      query: { ending_before: 'uuid', before: 'ignored' },
    };

    expect(parseEndingBeforeRestRequest(request)).toEqual('uuid');
  });
});
