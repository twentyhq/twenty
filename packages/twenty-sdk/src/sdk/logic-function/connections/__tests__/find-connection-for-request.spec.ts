import { describe, expect, it } from 'vitest';

import { findConnectionForRequest } from '@/sdk/logic-function/connections/find-connection-for-request';
import { type AppConnection } from '@/sdk/logic-function/connections/types/app-connection.type';

const buildConnection = (
  overrides: Partial<AppConnection> = {},
): AppConnection => ({
  id: 'c-1',
  providerName: 'linear',
  name: 'Linear #1',
  handle: 'octocat@example.com',
  visibility: 'user',
  userWorkspaceId: 'uws-me',
  accessToken: 'token-fresh',
  scopes: ['read'],
  authFailedAt: null,
  ...overrides,
});

describe('findConnectionForRequest', () => {
  it('returns the request user’s personal credential when one exists', () => {
    const personal = buildConnection({ id: 'mine', userWorkspaceId: 'uws-me' });
    const someoneElses = buildConnection({
      id: 'theirs',
      userWorkspaceId: 'uws-other',
    });
    const shared = buildConnection({ id: 'shared', visibility: 'workspace' });

    expect(
      findConnectionForRequest([someoneElses, shared, personal], {
        userWorkspaceId: 'uws-me',
      }),
    ).toBe(personal);
  });

  it('falls back to a workspace-shared credential when no personal one exists', () => {
    const someoneElses = buildConnection({
      id: 'theirs',
      userWorkspaceId: 'uws-other',
    });
    const shared = buildConnection({ id: 'shared', visibility: 'workspace' });

    expect(
      findConnectionForRequest([someoneElses, shared], {
        userWorkspaceId: 'uws-me',
      }),
    ).toBe(shared);
  });

  it('returns workspace-shared even when event.userWorkspaceId is null', () => {
    // Cron / DB-event triggers carry no user context. The handler should still
    // be able to lean on a workspace-shared credential.
    const shared = buildConnection({ id: 'shared', visibility: 'workspace' });

    expect(findConnectionForRequest([shared], { userWorkspaceId: null })).toBe(
      shared,
    );
  });

  it('returns null when nothing matches', () => {
    expect(
      findConnectionForRequest([], { userWorkspaceId: 'uws-me' }),
    ).toBeNull();

    const onlyOtherUser = buildConnection({
      id: 'theirs',
      userWorkspaceId: 'uws-other',
    });

    expect(
      findConnectionForRequest([onlyOtherUser], {
        userWorkspaceId: 'uws-me',
      }),
    ).toBeNull();
  });

  it('does not pick a workspace-shared connection over a personal one', () => {
    // Even when the workspace-shared row appears first in the array, the
    // personal one wins — we never want a request user to silently fall
    // through to a service-account credential.
    const shared = buildConnection({ id: 'shared', visibility: 'workspace' });
    const personal = buildConnection({ id: 'mine', userWorkspaceId: 'uws-me' });

    expect(
      findConnectionForRequest([shared, personal], {
        userWorkspaceId: 'uws-me',
      }),
    ).toBe(personal);
  });
});
