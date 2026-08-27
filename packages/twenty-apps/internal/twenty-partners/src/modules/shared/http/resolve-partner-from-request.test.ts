import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { coreQueryMock, metadataQueryMock } = vi.hoisted(() => ({
  coreQueryMock: vi.fn(),
  metadataQueryMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: coreQueryMock, mutation: vi.fn() };
  }),
}));

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: vi.fn(function () {
    return { query: metadataQueryMock };
  }),
}));

import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import {
  decodeJwtClaims,
  errorResponse,
  resolvePartnerFromForwardedToken,
  resolvePartnerFromRequest,
} from './resolve-partner-from-request.service';

const makeToken = (payload: Record<string, unknown>): string => {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `header.${body}.sig`;
};

describe('decodeJwtClaims', () => {
  it('decodes userId and userWorkspaceId from a base64url payload', () => {
    const token = makeToken({
      userId: 'u-1',
      userWorkspaceId: 'uw-1',
      extra: 'x',
    });
    expect(decodeJwtClaims(token)).toMatchObject({
      userId: 'u-1',
      userWorkspaceId: 'uw-1',
    });
  });

  it('returns {} for a garbage string', () => {
    expect(decodeJwtClaims('not-a-jwt')).toEqual({});
  });

  it('returns {} for an empty string', () => {
    expect(decodeJwtClaims('')).toEqual({});
  });

  it('returns {} when the payload segment is not valid JSON', () => {
    expect(decodeJwtClaims('header.%%%.sig')).toEqual({});
  });

  it('returns {} when the payload decodes to a non-object (null)', () => {
    const token = `header.${Buffer.from('null').toString('base64url')}.sig`;
    expect(decodeJwtClaims(token)).toEqual({});
  });
});

describe('resolvePartnerFromRequest guards (no network)', () => {
  const original = process.env.TWENTY_APP_ACCESS_TOKEN;
  afterEach(() => {
    if (original === undefined) delete process.env.TWENTY_APP_ACCESS_TOKEN;
    else process.env.TWENTY_APP_ACCESS_TOKEN = original;
  });

  it('returns UNAUTHENTICATED when userWorkspaceId is absent', async () => {
    expect(await resolvePartnerFromRequest({})).toEqual({
      error: 'UNAUTHENTICATED',
    });
    expect(await resolvePartnerFromRequest({ userWorkspaceId: null })).toEqual({
      error: 'UNAUTHENTICATED',
    });
  });

  it('returns UNAUTHENTICATED when no app token is present to decode', async () => {
    delete process.env.TWENTY_APP_ACCESS_TOKEN;
    expect(
      await resolvePartnerFromRequest({ userWorkspaceId: 'uw-1' }),
    ).toEqual({
      error: 'UNAUTHENTICATED',
    });
  });

  it('returns UNAUTHENTICATED when the token userWorkspaceId does not match the injected one', async () => {
    process.env.TWENTY_APP_ACCESS_TOKEN = makeToken({
      userId: 'u-1',
      userWorkspaceId: 'uw-other',
    });
    expect(
      await resolvePartnerFromRequest({ userWorkspaceId: 'uw-1' }),
    ).toEqual({
      error: 'UNAUTHENTICATED',
    });
  });
});

describe('errorResponse', () => {
  it('wraps a reason in a failure envelope', () => {
    expect(errorResponse('NO_PARTNER')).toEqual({
      ok: false,
      reason: 'NO_PARTNER',
    });
  });
});

describe('resolvePartnerFromForwardedToken', () => {
  const USER_ID = 'user-1';
  const WORKSPACE_MEMBER_ID = 'member-1';
  const PARTNER_ID = 'partner-1';
  const PARTNER_NAME = 'Acme Partners';
  const WORKSPACE_ID = 'workspace-1';
  const AUTHORIZATION = 'Bearer forwarded-token';

  const originalAppToken = process.env.TWENTY_APP_ACCESS_TOKEN;
  afterEach(() => {
    if (originalAppToken === undefined)
      delete process.env.TWENTY_APP_ACCESS_TOKEN;
    else process.env.TWENTY_APP_ACCESS_TOKEN = originalAppToken;
  });

  beforeEach(() => {
    coreQueryMock.mockReset();
    metadataQueryMock.mockReset();
    process.env.TWENTY_APP_ACCESS_TOKEN = makeToken({
      workspaceId: WORKSPACE_ID,
    });
    metadataQueryMock.mockResolvedValue({
      currentUser: { id: USER_ID, currentWorkspace: { id: WORKSPACE_ID } },
    });
    coreQueryMock.mockImplementation((selection: Record<string, unknown>) => {
      const key = Object.keys(selection)[0];
      if (key === 'workspaceMembers') {
        return Promise.resolve({
          workspaceMembers: { edges: [{ node: { id: WORKSPACE_MEMBER_ID } }] },
        });
      }
      return Promise.resolve({
        partners: { edges: [{ node: { id: PARTNER_ID, name: PARTNER_NAME } }] },
      });
    });
  });

  it('returns UNAUTHENTICATED when there is no authorization header', async () => {
    expect(await resolvePartnerFromForwardedToken({})).toEqual({
      error: 'UNAUTHENTICATED',
    });
    expect(await resolvePartnerFromForwardedToken({ headers: {} })).toEqual({
      error: 'UNAUTHENTICATED',
    });
    expect(metadataQueryMock).not.toHaveBeenCalled();
  });

  it('returns UNAUTHENTICATED when the header has no Bearer prefix', async () => {
    expect(
      await resolvePartnerFromForwardedToken({
        headers: { authorization: 'forwarded-token' },
      }),
    ).toEqual({ error: 'UNAUTHENTICATED' });
    expect(metadataQueryMock).not.toHaveBeenCalled();
  });

  it('returns UNAUTHENTICATED when the server rejects the forwarded token', async () => {
    metadataQueryMock.mockRejectedValue(new Error('Unauthorized'));

    expect(
      await resolvePartnerFromForwardedToken({
        headers: { authorization: AUTHORIZATION },
      }),
    ).toEqual({ error: 'UNAUTHENTICATED' });
    expect(coreQueryMock).not.toHaveBeenCalled();
  });

  it('returns UNAUTHENTICATED when currentUser carries no id', async () => {
    metadataQueryMock.mockResolvedValue({ currentUser: null });

    expect(
      await resolvePartnerFromForwardedToken({
        headers: { authorization: AUTHORIZATION },
      }),
    ).toEqual({ error: 'UNAUTHENTICATED' });
    expect(coreQueryMock).not.toHaveBeenCalled();
  });

  it('returns UNAUTHENTICATED when the token belongs to another workspace', async () => {
    metadataQueryMock.mockResolvedValue({
      currentUser: { id: USER_ID, currentWorkspace: { id: 'workspace-other' } },
    });

    expect(
      await resolvePartnerFromForwardedToken({
        headers: { authorization: AUTHORIZATION },
      }),
    ).toEqual({ error: 'UNAUTHENTICATED' });
    expect(coreQueryMock).not.toHaveBeenCalled();
  });

  it('returns UNAUTHENTICATED when the app token carries no workspace to compare against', async () => {
    delete process.env.TWENTY_APP_ACCESS_TOKEN;

    expect(
      await resolvePartnerFromForwardedToken({
        headers: { authorization: AUTHORIZATION },
      }),
    ).toEqual({ error: 'UNAUTHENTICATED' });
    expect(coreQueryMock).not.toHaveBeenCalled();
  });

  it('resolves the partner by verifying the token against currentUser', async () => {
    const result = await resolvePartnerFromForwardedToken({
      headers: { authorization: AUTHORIZATION },
    });

    expect(result).toEqual({
      partnerId: PARTNER_ID,
      partnerName: PARTNER_NAME,
      workspaceMemberId: WORKSPACE_MEMBER_ID,
    });
    expect(metadataQueryMock).toHaveBeenCalledWith({
      currentUser: { id: true, currentWorkspace: { id: true } },
    });
    expect(MetadataApiClient).toHaveBeenCalledWith({
      headers: { Authorization: AUTHORIZATION },
    });
  });
});
