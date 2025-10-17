import { parseSoftDeleteRestRequest } from 'src/engine/api/rest/input-request-parsers/soft-delete-parser-utils/parse-soft-delete-rest-request.util';
import { parseUpsertRestRequest } from 'src/engine/api/rest/input-request-parsers/upsert-parser-utils/parse-upsert-rest-request.util';

describe('parseSoftDeleteRestRequest', () => {
  it('should return false when softDelete query parameter is not defined', () => {
    const request = {
      query: {},
    } as any;

    const result = parseSoftDeleteRestRequest(request);

    expect(result).toBe(false);
  });

  it('should return true when softDelete query parameter is "true"', () => {
    const request = {
      query: {
        softDelete: 'true',
      },
    } as any;

    const result = parseUpsertRestRequest(request);

    expect(result).toBe(true);
  });

  it('should return false when softDelete query parameter is "false"', () => {
    const request = {
      query: {
        softDelete: 'false',
      },
    } as any;

    const result = parseUpsertRestRequest(request);

    expect(result).toBe(false);
  });

  it('should return false when softDelete query parameter is empty string', () => {
    const request = {
      query: {
        softDelete: '',
      },
    } as any;

    const result = parseUpsertRestRequest(request);

    expect(result).toBe(false);
  });

  it('should return false when softDelete query parameter is a boolean true', () => {
    const request = {
      query: {
        softDelete: true,
      },
    } as any;

    const result = parseUpsertRestRequest(request);

    expect(result).toBe(false);
  });
});
