import { describe, expect, it } from 'vitest';

import { parseRecomputeRequest } from 'src/logic-functions/utils/parse-recompute-request';

const buildRoutePayload = (body: unknown) =>
  ({
    headers: {},
    queryStringParameters: {},
    pathParameters: {},
    body,
    isBase64Encoded: false,
    requestContext: {
      http: { method: 'POST', path: '/last-contact/recompute-last-contact' },
    },
    userWorkspaceId: 'user-workspace-1',
  }) as never;

describe('parseRecomputeRequest', () => {
  it('should read the target and ids from a route payload body', () => {
    const result = parseRecomputeRequest(
      buildRoutePayload({
        objectNameSingular: 'company',
        recordIds: ['company-1', 'company-2'],
      }),
    );

    expect(result).toEqual({
      isValid: true,
      request: {
        objectNameSingular: 'company',
        recordIds: ['company-1', 'company-2'],
      },
    });
  });

  it('should accept a direct request object', () => {
    const result = parseRecomputeRequest({
      objectNameSingular: 'person',
      recordIds: ['person-1'],
    });

    expect(result).toEqual({
      isValid: true,
      request: { objectNameSingular: 'person', recordIds: ['person-1'] },
    });
  });

  it('should accept an empty selection', () => {
    const result = parseRecomputeRequest({
      objectNameSingular: 'opportunity',
      recordIds: [],
    });

    expect(result).toEqual({
      isValid: true,
      request: { objectNameSingular: 'opportunity', recordIds: [] },
    });
  });

  it('should reject an unknown target object', () => {
    const result = parseRecomputeRequest(
      buildRoutePayload({ objectNameSingular: 'note', recordIds: ['note-1'] }),
    );

    expect(result.isValid).toBe(false);
  });

  it('should reject a missing target object', () => {
    expect(parseRecomputeRequest(buildRoutePayload({})).isValid).toBe(false);
    expect(parseRecomputeRequest(buildRoutePayload(null)).isValid).toBe(false);
  });

  it('should reject recordIds that are not an array', () => {
    const result = parseRecomputeRequest(
      buildRoutePayload({
        objectNameSingular: 'person',
        recordIds: 'person-1',
      }),
    );

    expect(result).toEqual({
      isValid: false,
      message: 'recordIds must be an array',
    });
  });

  it('should reject duplicate or empty ids rather than silently dropping them', () => {
    const result = parseRecomputeRequest(
      buildRoutePayload({
        objectNameSingular: 'person',
        recordIds: ['person-1', 'person-1'],
      }),
    );

    expect(result).toEqual({
      isValid: false,
      message: 'recordIds must contain unique non-empty strings',
    });
  });

  it('should reject more than 20 ids', () => {
    const recordIds = Array.from(
      { length: 21 },
      (_unused, index) => `person-${index}`,
    );

    const result = parseRecomputeRequest(
      buildRoutePayload({ objectNameSingular: 'person', recordIds }),
    );

    expect(result).toEqual({
      isValid: false,
      message: 'recordIds must contain at most 20 ids',
    });
  });

  it('should accept exactly 20 ids', () => {
    const recordIds = Array.from(
      { length: 20 },
      (_unused, index) => `person-${index}`,
    );

    const result = parseRecomputeRequest(
      buildRoutePayload({ objectNameSingular: 'person', recordIds }),
    );

    expect(result.isValid).toBe(true);
  });
});
