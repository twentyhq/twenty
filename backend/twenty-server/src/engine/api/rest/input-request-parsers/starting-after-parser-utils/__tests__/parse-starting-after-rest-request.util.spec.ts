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
});
