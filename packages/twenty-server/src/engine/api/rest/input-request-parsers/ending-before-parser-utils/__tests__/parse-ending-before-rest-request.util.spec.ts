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

  it('should return undefined when before alias is used (silently ignored)', () => {
    const request: any = { query: { before: 'uuid' } };

    expect(parseEndingBeforeRestRequest(request)).toEqual(undefined);
  });

  it('should return undefined when cursor alias is used (silently ignored)', () => {
    const request: any = { query: { cursor: 'uuid' } };

    expect(parseEndingBeforeRestRequest(request)).toEqual(undefined);
  });

  it('should return undefined when ending_before is an array', () => {
    const request: any = { query: { ending_before: ['uuid1', 'uuid2'] } };

    expect(parseEndingBeforeRestRequest(request)).toEqual(undefined);
  });

  it('should return undefined when ending_before is a number', () => {
    const request: any = { query: { ending_before: 123 } };

    expect(parseEndingBeforeRestRequest(request)).toEqual(undefined);
  });

  it('should not throw for unrelated query params', () => {
    const request: any = { query: { limit: 10, filter: 'name[eq]:test' } };

    expect(parseEndingBeforeRestRequest(request)).toEqual(undefined);
  });
});
