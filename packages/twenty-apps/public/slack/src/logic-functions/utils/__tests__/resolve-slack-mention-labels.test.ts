import { type WebClient } from '@slack/web-api';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveSlackMentionLabels } from 'src/logic-functions/utils/resolve-slack-mention-labels';

const {
  findSlackUserLinksBySlackUserIdsMock,
  findWorkspaceMemberNamesByIdsMock,
} = vi.hoisted(() => ({
  findSlackUserLinksBySlackUserIdsMock: vi.fn(),
  findWorkspaceMemberNamesByIdsMock: vi.fn(),
}));

vi.mock(
  'src/logic-functions/data/find-slack-user-links-by-slack-user-ids',
  () => ({
    findSlackUserLinksBySlackUserIds: findSlackUserLinksBySlackUserIdsMock,
  }),
);

vi.mock('src/logic-functions/data/find-workspace-member-names-by-ids', () => ({
  findWorkspaceMemberNamesByIds: findWorkspaceMemberNamesByIdsMock,
}));

const client = {} as CoreApiClient;

const authTestMock = vi.fn();
const usersInfoMock = vi.fn();

const slackClient = {
  auth: { test: authTestMock },
  users: { info: usersInfoMock },
} as unknown as WebClient;

const slackUser = ({
  id,
  displayName,
}: {
  id: string;
  displayName: string;
}) => ({
  user: {
    id,
    team_id: 'T0INSTALLED',
    profile: { display_name: displayName, email: `${id}@twenty.com` },
    is_email_confirmed: true,
  },
});

describe('resolveSlackMentionLabels', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authTestMock.mockResolvedValue({ team_id: 'T0INSTALLED' });
    findSlackUserLinksBySlackUserIdsMock.mockResolvedValue(new Map());
    findWorkspaceMemberNamesByIdsMock.mockResolvedValue(new Map());
    usersInfoMock.mockResolvedValue(undefined);
  });

  it('should label a linked Slack user with the workspace member name and id', async () => {
    findSlackUserLinksBySlackUserIdsMock.mockResolvedValue(
      new Map([
        [
          'U04ABC',
          {
            slackUserId: 'U04ABC',
            name: 'alice.m',
            workspaceMemberId: 'member-1',
          },
        ],
      ]),
    );
    findWorkspaceMemberNamesByIdsMock.mockResolvedValue(
      new Map([['member-1', 'Alice Martin']]),
    );

    const labels = await resolveSlackMentionLabels({
      slackUserIds: ['U04ABC'],
      client,
      slackClient,
      assistantBotUserId: 'UBOT',
    });

    expect(labels.get('U04ABC')).toBe(
      '@Alice Martin (workspace member member-1)',
    );
    expect(usersInfoMock).not.toHaveBeenCalled();
  });

  it('should label an unlinked Slack user with its display name and no member id', async () => {
    usersInfoMock.mockResolvedValue(
      slackUser({ id: 'U05DEF', displayName: 'Bob Lee' }),
    );

    const labels = await resolveSlackMentionLabels({
      slackUserIds: ['U05DEF'],
      client,
      slackClient,
      assistantBotUserId: 'UBOT',
    });

    expect(labels.get('U05DEF')).toBe('@Bob Lee (no Twenty workspace member)');
  });

  it('should label a Slack user that Slack cannot resolve as unknown', async () => {
    usersInfoMock.mockRejectedValue(new Error('user_not_found'));

    const labels = await resolveSlackMentionLabels({
      slackUserIds: ['U0GONE'],
      client,
      slackClient,
      assistantBotUserId: 'UBOT',
    });

    expect(labels.get('U0GONE')).toBe('@unknown Slack user U0GONE');
  });

  it('should never hand out a member id whose workspace member no longer exists', async () => {
    findSlackUserLinksBySlackUserIdsMock.mockResolvedValue(
      new Map([
        [
          'U04ABC',
          {
            slackUserId: 'U04ABC',
            name: 'alice.m',
            workspaceMemberId: 'deleted-member',
          },
        ],
      ]),
    );
    findWorkspaceMemberNamesByIdsMock.mockResolvedValue(new Map());

    const labels = await resolveSlackMentionLabels({
      slackUserIds: ['U04ABC'],
      client,
      slackClient,
      assistantBotUserId: 'UBOT',
    });

    expect(labels.get('U04ABC')).toBe('@alice.m (no Twenty workspace member)');
    expect(usersInfoMock).not.toHaveBeenCalled();
  });

  it('should resolve several mentions in one batch of lookups', async () => {
    findSlackUserLinksBySlackUserIdsMock.mockResolvedValue(
      new Map([
        [
          'U04ABC',
          {
            slackUserId: 'U04ABC',
            name: 'alice.m',
            workspaceMemberId: 'member-1',
          },
        ],
      ]),
    );
    findWorkspaceMemberNamesByIdsMock.mockResolvedValue(
      new Map([['member-1', 'Alice Martin']]),
    );
    usersInfoMock.mockImplementation(({ user }: { user: string }) =>
      Promise.resolve(slackUser({ id: user, displayName: 'Bob Lee' })),
    );

    const labels = await resolveSlackMentionLabels({
      slackUserIds: ['U04ABC', 'U05DEF'],
      client,
      slackClient,
      assistantBotUserId: 'UBOT',
    });

    expect(labels.get('U04ABC')).toBe(
      '@Alice Martin (workspace member member-1)',
    );
    expect(labels.get('U05DEF')).toBe('@Bob Lee (no Twenty workspace member)');
    expect(findSlackUserLinksBySlackUserIdsMock).toHaveBeenCalledTimes(1);
    expect(findSlackUserLinksBySlackUserIdsMock).toHaveBeenCalledWith(client, {
      slackTeamId: 'T0INSTALLED',
      slackUserIds: ['U04ABC', 'U05DEF'],
    });
    expect(findWorkspaceMemberNamesByIdsMock).toHaveBeenCalledTimes(1);
  });

  it('should bound the Slack lookups it fires for unlinked mentions', async () => {
    usersInfoMock.mockImplementation(({ user }: { user: string }) =>
      Promise.resolve(slackUser({ id: user, displayName: `name ${user}` })),
    );

    const slackUserIds = Array.from(
      { length: 30 },
      (_unused, index) => `U${index}`,
    );

    const labels = await resolveSlackMentionLabels({
      slackUserIds,
      client,
      slackClient,
      assistantBotUserId: 'UBOT',
    });

    expect(usersInfoMock.mock.calls.length).toBeLessThanOrEqual(8);
    expect(labels.get('U0')).toBe('@name U0 (no Twenty workspace member)');
    expect(labels.get('U29')).toBe('@unknown Slack user U29');
  });

  it('should read a mention of the assistant itself as you', async () => {
    const labels = await resolveSlackMentionLabels({
      slackUserIds: ['UBOT'],
      client,
      slackClient,
      assistantBotUserId: 'UBOT',
    });

    expect(labels.get('UBOT')).toBe('you');
    expect(findSlackUserLinksBySlackUserIdsMock).not.toHaveBeenCalled();
  });

  it('should fall back to unknown when Slack is unreachable', async () => {
    const labels = await resolveSlackMentionLabels({
      slackUserIds: ['U04ABC'],
      client,
      slackClient: undefined,
      assistantBotUserId: 'UBOT',
    });

    expect(labels.get('U04ABC')).toBe('@unknown Slack user U04ABC');
  });

  it('should fall back to unknown when the link query fails', async () => {
    findSlackUserLinksBySlackUserIdsMock.mockRejectedValue(
      new Error('permission denied'),
    );

    const labels = await resolveSlackMentionLabels({
      slackUserIds: ['U04ABC'],
      client,
      slackClient,
      assistantBotUserId: 'UBOT',
    });

    expect(labels.get('U04ABC')).toBe('@unknown Slack user U04ABC');
  });
});
