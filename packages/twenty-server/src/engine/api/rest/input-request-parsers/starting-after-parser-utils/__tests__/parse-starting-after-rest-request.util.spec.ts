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

  it('should return undefined when cursor alias is used (silently ignored)', () => {
    const request: any = { query: { cursor: 'uuid' } };

    expect(parseStartingAfterRestRequest(request)).toEqual(undefined);
  });

  it('should return undefined when starting_after is an array', () => {
    const request: any = { query: { starting_after: ['uuid1', 'uuid2'] } };

    expect(parseStartingAfterRestRequest(request)).toEqual(undefined);
  });

  it('should return undefined when starting_after is a number', () => {
    const request: any = { query: { starting_after: 123 } };

    expect(parseStartingAfterRestRequest(request)).toEqual(undefined);
  });

  it('should not throw for unrelated query params', () => {
    const request: any = { query: { limit: 10, filter: 'name[eq]:test' } };

    expect(parseStartingAfterRestRequest(request)).toEqual(undefined);
  });
});
