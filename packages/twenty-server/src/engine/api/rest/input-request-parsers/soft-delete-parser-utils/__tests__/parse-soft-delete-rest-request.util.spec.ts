import { parseSoftDeleteRestRequest } from 'src/engine/api/rest/input-request-parsers/soft-delete-parser-utils/parse-soft-delete-rest-request.util';

describe('parseSoftDeleteRestRequest', () => {
  it('should return false when soft_delete query parameter is not defined', () => {
    const request = {
      query: {},
    } as any;

    const result = parseSoftDeleteRestRequest(request);

    expect(result).toBe(false);
  });

  it('should return true when soft_delete query parameter is "true"', () => {
    const request = {
      query: {
        soft_delete: 'true',
      },
    } as any;

    const result = parseSoftDeleteRestRequest(request);

    expect(result).toBe(true);
  });

  it('should return false when soft_delete query parameter is "false"', () => {
    const request = {
      query: {
        soft_delete: 'false',
      },
    } as any;

    const result = parseSoftDeleteRestRequest(request);

    expect(result).toBe(false);
  });

  it('should return false when soft_delete query parameter is empty string', () => {
    const request = {
      query: {
        soft_delete: '',
      },
    } as any;

    const result = parseSoftDeleteRestRequest(request);

    expect(result).toBe(false);
  });

  it('should return false when soft_delete query parameter is a boolean true', () => {
    const request = {
      query: {
        soft_delete: true,
      },
    } as any;

    const result = parseSoftDeleteRestRequest(request);

    expect(result).toBe(false);
  });
});
