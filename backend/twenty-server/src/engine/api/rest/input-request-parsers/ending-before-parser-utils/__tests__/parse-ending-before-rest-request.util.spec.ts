import { parseEndingBeforeRestRequest } from 'src/engine/api/rest/input-request-parsers/ending-before-parser-utils/parse-ending-before-rest-request.util';

describe('parseEndingBeforeRestRequest', () => {
  it('should return default if ending_before missing', () => {
    const request: any = { query: {} };

    expect(parseEndingBeforeRestRequest(request)).toEqual(undefined);
  });

  it('should return ending_before', () => {
    const request: any = { query: { ending_before: 'uuid' } };

    expect(parseEndingBeforeRestRequest(request)).toEqual('uuid');
  });
});
