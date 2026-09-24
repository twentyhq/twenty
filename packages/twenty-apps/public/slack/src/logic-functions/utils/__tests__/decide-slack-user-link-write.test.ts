import { type WebClient } from '@slack/web-api';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { decideSlackUserLinkWrite } from 'src/logic-functions/utils/decide-slack-user-link-write';

const { findWorkspaceMemberEmailByIdMock, fetchSlackUserIdentityMock } =
  vi.hoisted(() => ({
    findWorkspaceMemberEmailByIdMock: vi.fn(),
    fetchSlackUserIdentityMock: vi.fn(),
  }));

vi.mock('src/logic-functions/data/find-workspace-member-email-by-id', () => ({
  findWorkspaceMemberEmailById: findWorkspaceMemberEmailByIdMock,
}));

vi.mock('src/logic-functions/utils/fetch-slack-user-identity', () => ({
  fetchSlackUserIdentity: fetchSlackUserIdentityMock,
}));

const SLACK_USER_ID = 'U0123456789';
const WORKSPACE_MEMBER_ID = 'member-1';
const EMAIL = 'ada@twenty.com';

const client = {} as CoreApiClient;
const slackClient = {} as WebClient;

type DecideOverrides = Partial<
  Pick<
    Parameters<typeof decideSlackUserLinkWrite>[0],
    'fetchedIdentity' | 'isInInstalledWorkspace' | 'isSameMemberRelink'
  >
>;

const decide = (overrides: DecideOverrides = {}) =>
  decideSlackUserLinkWrite({
    client,
    slackClient,
    slackUserId: SLACK_USER_ID,
    workspaceMemberId: WORKSPACE_MEMBER_ID,
    fetchedIdentity: undefined,
    isInInstalledWorkspace: true,
    isSameMemberRelink: false,
    ...overrides,
  });

const buildIdentity = (overrides: Record<string, unknown> = {}) => ({
  slackUserId: SLACK_USER_ID,
  slackTeamId: 'T0INSTALLED',
  displayName: 'Ada Lovelace',
  email: EMAIL,
  isRegularUserAccount: true,
  ...overrides,
});

describe('decideSlackUserLinkWrite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findWorkspaceMemberEmailByIdMock.mockResolvedValue(EMAIL);
    fetchSlackUserIdentityMock.mockResolvedValue(buildIdentity());
  });

  it('should activate a link whose emails match, with no approval step', async () => {
    expect(await decide()).toEqual({
      isEagerAutoMatch: true,
      requiresConsent: false,
      consentState: 'ACTIVE',
      source: 'AUTO',
    });
  });

  it('should match emails case-insensitively', async () => {
    findWorkspaceMemberEmailByIdMock.mockResolvedValue('ADA@Twenty.com');

    expect(await decide()).toMatchObject({ isEagerAutoMatch: true });
  });

  it('should ask for consent when the emails differ', async () => {
    findWorkspaceMemberEmailByIdMock.mockResolvedValue('grace@twenty.com');

    expect(await decide()).toEqual({
      isEagerAutoMatch: false,
      requiresConsent: true,
      consentState: 'PENDING',
      source: 'MANUAL',
    });
  });

  it('should ask for consent when Slack reports no email for the account', async () => {
    fetchSlackUserIdentityMock.mockResolvedValue(
      buildIdentity({ email: undefined }),
    );

    expect(await decide()).toMatchObject({
      requiresConsent: true,
      consentState: 'PENDING',
    });
  });

  it('should not treat a guest account email as a match even when it is equal', async () => {
    fetchSlackUserIdentityMock.mockResolvedValue(
      buildIdentity({ isRegularUserAccount: false }),
    );

    expect(await decide()).toMatchObject({
      isEagerAutoMatch: false,
      requiresConsent: true,
      consentState: 'PENDING',
    });
  });

  it('should admin-set an account outside the installed workspace without asking', async () => {
    expect(await decide({ isInInstalledWorkspace: false })).toEqual({
      isEagerAutoMatch: false,
      requiresConsent: false,
      consentState: 'ADMIN_SET',
      source: 'MANUAL',
    });
  });

  it('should not look the account up at all when it is outside the installed workspace', async () => {
    await decide({ isInInstalledWorkspace: false });

    expect(fetchSlackUserIdentityMock).not.toHaveBeenCalled();
    expect(findWorkspaceMemberEmailByIdMock).not.toHaveBeenCalled();
  });

  it('should leave consent untouched when the same member is saved again', async () => {
    expect(await decide({ isSameMemberRelink: true })).toEqual({
      isEagerAutoMatch: false,
      requiresConsent: false,
      consentState: undefined,
      source: undefined,
    });
  });

  it('should reuse an identity already fetched instead of asking Slack again', async () => {
    await decide({ fetchedIdentity: buildIdentity() });

    expect(fetchSlackUserIdentityMock).not.toHaveBeenCalled();
  });
});
