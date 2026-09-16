import { type WebClient } from '@slack/web-api';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type SlackIdentityResolution } from 'src/logic-functions/types/slack-identity-resolution.type';
import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';
import { resolveSlackAccessDecision } from 'src/logic-functions/utils/resolve-slack-access-decision';

const { resolveSlackIdentitiesMock } = vi.hoisted(() => ({
  resolveSlackIdentitiesMock: vi.fn(),
}));

vi.mock('src/logic-functions/utils/resolve-slack-identities', () => ({
  resolveSlackIdentities: resolveSlackIdentitiesMock,
}));

const SLACK_USER_ID = 'U1';

const identity: SlackUserIdentity = {
  slackUserId: SLACK_USER_ID,
  slackTeamId: 'T1',
  email: 'member@example.com',
  displayName: 'Member',
  isRegularUserAccount: true,
};

const client = {} as CoreApiClient;
const slackClient = {} as WebClient;

const RESOLUTION_BASE = {
  slackUserId: SLACK_USER_ID,
  identity,
  link: undefined,
};

const mockResolution = (resolution: SlackIdentityResolution) => {
  resolveSlackIdentitiesMock.mockResolvedValue(
    new Map([[SLACK_USER_ID, resolution]]),
  );
};

describe('resolveSlackAccessDecision', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow everyone when the workspace is open', async () => {
    expect(
      await resolveSlackAccessDecision({
        accessMode: 'ANYONE',
        client,
        slackClient,
        identity: undefined,
        runAsWorkspaceMemberId: undefined,
      }),
    ).toEqual({ status: 'ALLOWED' });

    expect(resolveSlackIdentitiesMock).not.toHaveBeenCalled();
  });

  it('should allow a request already running as a workspace member without resolving again', async () => {
    expect(
      await resolveSlackAccessDecision({
        accessMode: 'ONLY_LINKED_MEMBERS',
        client,
        slackClient,
        identity,
        runAsWorkspaceMemberId: 'member-id',
      }),
    ).toEqual({ status: 'ALLOWED' });

    expect(resolveSlackIdentitiesMock).not.toHaveBeenCalled();
  });

  it('should allow a linked member whose request is not eligible for impersonation', async () => {
    mockResolution({
      ...RESOLUTION_BASE,
      outcome: 'confirmedMember',
      workspaceMemberId: 'member-id',
      memberProvenance: 'verifiedEmail',
    });

    expect(
      await resolveSlackAccessDecision({
        accessMode: 'ONLY_LINKED_MEMBERS',
        client,
        slackClient,
        identity,
        runAsWorkspaceMemberId: undefined,
      }),
    ).toEqual({ status: 'ALLOWED' });
  });

  it('should deny an account every lookup agreed is not a member', async () => {
    mockResolution({ ...RESOLUTION_BASE, outcome: 'membershipNotConfirmed' });

    expect(
      await resolveSlackAccessDecision({
        accessMode: 'ONLY_LINKED_MEMBERS',
        client,
        slackClient,
        identity,
        runAsWorkspaceMemberId: undefined,
      }),
    ).toEqual({ status: 'DENIED' });
  });

  it('should not deny when membership could not be established', async () => {
    mockResolution({ ...RESOLUTION_BASE, outcome: 'membershipUnverifiable' });

    expect(
      await resolveSlackAccessDecision({
        accessMode: 'ONLY_LINKED_MEMBERS',
        client,
        slackClient,
        identity,
        runAsWorkspaceMemberId: undefined,
      }),
    ).toEqual({ status: 'UNVERIFIABLE' });
  });

  it('should not deny when the requester could not be identified', async () => {
    mockResolution({
      ...RESOLUTION_BASE,
      identity: undefined,
      outcome: 'unidentified',
    });

    expect(
      await resolveSlackAccessDecision({
        accessMode: 'ONLY_LINKED_MEMBERS',
        client,
        slackClient,
        identity,
        runAsWorkspaceMemberId: undefined,
      }),
    ).toEqual({ status: 'UNVERIFIABLE' });
  });

  it('should not deny when resolution throws', async () => {
    resolveSlackIdentitiesMock.mockRejectedValue(
      new Error('slack unreachable'),
    );

    expect(
      await resolveSlackAccessDecision({
        accessMode: 'ONLY_LINKED_MEMBERS',
        client,
        slackClient,
        identity,
        runAsWorkspaceMemberId: undefined,
      }),
    ).toEqual({ status: 'UNVERIFIABLE' });
  });

  it('should not deny when resolution returns nothing for the requester', async () => {
    resolveSlackIdentitiesMock.mockResolvedValue(new Map());

    expect(
      await resolveSlackAccessDecision({
        accessMode: 'ONLY_LINKED_MEMBERS',
        client,
        slackClient,
        identity,
        runAsWorkspaceMemberId: undefined,
      }),
    ).toEqual({ status: 'UNVERIFIABLE' });
  });

  it('should not deny without a Slack client or an identity to look up', async () => {
    expect(
      await resolveSlackAccessDecision({
        accessMode: 'ONLY_LINKED_MEMBERS',
        client,
        slackClient: undefined,
        identity,
        runAsWorkspaceMemberId: undefined,
      }),
    ).toEqual({ status: 'UNVERIFIABLE' });

    expect(
      await resolveSlackAccessDecision({
        accessMode: 'ONLY_LINKED_MEMBERS',
        client,
        slackClient,
        identity: undefined,
        runAsWorkspaceMemberId: undefined,
      }),
    ).toEqual({ status: 'UNVERIFIABLE' });

    expect(resolveSlackIdentitiesMock).not.toHaveBeenCalled();
  });
});
