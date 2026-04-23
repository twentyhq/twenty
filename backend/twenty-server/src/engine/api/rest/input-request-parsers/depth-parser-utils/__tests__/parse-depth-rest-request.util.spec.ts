import { parseDepthRestRequest } from 'src/engine/api/rest/input-request-parsers/depth-parser-utils/parse-depth-rest-request.util';
import { RestInputRequestParserException } from 'src/engine/api/rest/input-request-parsers/rest-input-request-parser.exception';

describe('parseDepthRestRequest', () => {
  it('should return 0 when depth parameter is not provided', () => {
    const request: any = {
      query: {},
    };

    expect(parseDepthRestRequest(request)).toBe(0);
  });

  it('should parse depth=0', () => {
    const request: any = {
      query: { depth: '0' },
    };

    expect(parseDepthRestRequest(request)).toBe(0);
  });

  it('should throw if depth is not a number', () => {
    const request: any = {
      query: { depth: 'invalid' },
    };

    expect(() => parseDepthRestRequest(request)).toThrow(
      RestInputRequestParserException,
    );
    expect(() => parseDepthRestRequest(request)).toThrow(
      "'depth=invalid' parameter invalid. Allowed values are 0, 1",
    );
  });

  it('should throw if depth is not in allowed values (2)', () => {
    const request: any = {
      query: { depth: '2' },
    };

    expect(() => parseDepthRestRequest(request)).toThrow(
      RestInputRequestParserException,
    );
    expect(() => parseDepthRestRequest(request)).toThrow(
      "'depth=2' parameter invalid. Allowed values are 0, 1",
    );
  });
});
