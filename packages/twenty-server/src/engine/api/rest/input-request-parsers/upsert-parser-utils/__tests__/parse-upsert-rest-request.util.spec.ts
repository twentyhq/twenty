import { parseUpsertRestRequest } from 'src/engine/api/rest/input-request-parsers/upsert-parser-utils/parse-upsert-rest-request.util';

describe('parseUpsertRestRequest', () => {
  it('should return false when upsert query parameter is not defined', () => {
    const request = {
      query: {},
    } as any;

    const result = parseUpsertRestRequest(request);

    expect(result).toBe(false);
  });

  it('should return true when upsert query parameter is "true"', () => {
    const request = {
      query: {
        upsert: 'true',
      },
    } as any;

    const result = parseUpsertRestRequest(request);

    expect(result).toBe(true);
  });

  it('should return false when upsert query parameter is "false"', () => {
    const request = {
      query: {
        upsert: 'false',
      },
    } as any;

    const result = parseUpsertRestRequest(request);

    expect(result).toBe(false);
  });

  it('should return false when upsert query parameter is empty string', () => {
    const request = {
      query: {
        upsert: '',
      },
    } as any;

    const result = parseUpsertRestRequest(request);

    expect(result).toBe(false);
  });

  it('should return false when upsert query parameter is a boolean true', () => {
    const request = {
      query: {
        upsert: true,
      },
    } as any;

    const result = parseUpsertRestRequest(request);

    expect(result).toBe(false);
  });
});
