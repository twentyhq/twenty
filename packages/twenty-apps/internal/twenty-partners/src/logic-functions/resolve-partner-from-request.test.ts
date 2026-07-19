import { afterEach, describe, expect, it } from 'vitest';

import {
  decodeJwtClaims,
  errorResponse,
  resolvePartnerFromRequest,
} from './resolve-partner-from-request';

const makeToken = (payload: Record<string, unknown>): string => {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `header.${body}.sig`;
};

describe('decodeJwtClaims', () => {
  it('decodes userId and userWorkspaceId from a base64url payload', () => {
    const token = makeToken({ userId: 'u-1', userWorkspaceId: 'uw-1', extra: 'x' });
    expect(decodeJwtClaims(token)).toMatchObject({ userId: 'u-1', userWorkspaceId: 'uw-1' });
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
    expect(await resolvePartnerFromRequest({})).toEqual({ error: 'UNAUTHENTICATED' });
    expect(await resolvePartnerFromRequest({ userWorkspaceId: null })).toEqual({
      error: 'UNAUTHENTICATED',
    });
  });

  it('returns UNAUTHENTICATED when no app token is present to decode', async () => {
    delete process.env.TWENTY_APP_ACCESS_TOKEN;
    expect(await resolvePartnerFromRequest({ userWorkspaceId: 'uw-1' })).toEqual({
      error: 'UNAUTHENTICATED',
    });
  });

  it('returns UNAUTHENTICATED when the token userWorkspaceId does not match the injected one', async () => {
    process.env.TWENTY_APP_ACCESS_TOKEN = makeToken({
      userId: 'u-1',
      userWorkspaceId: 'uw-other',
    });
    expect(await resolvePartnerFromRequest({ userWorkspaceId: 'uw-1' })).toEqual({
      error: 'UNAUTHENTICATED',
    });
  });
});

describe('errorResponse', () => {
  it('wraps a reason in a failure envelope', () => {
    expect(errorResponse('NO_PARTNER')).toEqual({ ok: false, reason: 'NO_PARTNER' });
  });
});
