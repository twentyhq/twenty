import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';
import { resolveSlackRunAsWorkspaceMemberId } from 'src/logic-functions/utils/resolve-slack-run-as-workspace-member-id';

const {
  findSlackUserMappingWorkspaceMemberIdMock,
  findWorkspaceMemberIdByEmailMock,
  createSlackUserMappingMock,
} = vi.hoisted(() => ({
  findSlackUserMappingWorkspaceMemberIdMock: vi.fn(),
  findWorkspaceMemberIdByEmailMock: vi.fn(),
  createSlackUserMappingMock: vi.fn(),
}));

vi.mock('src/logic-functions/data/find-slack-user-mapping', () => ({
  findSlackUserMappingWorkspaceMemberId:
    findSlackUserMappingWorkspaceMemberIdMock,
}));

vi.mock('src/logic-functions/data/find-workspace-member-id-by-email', () => ({
  findWorkspaceMemberIdByEmail: findWorkspaceMemberIdByEmailMock,
}));

vi.mock('src/logic-functions/data/create-slack-user-mapping', () => ({
  createSlackUserMapping: createSlackUserMappingMock,
}));

const client = {} as CoreApiClient;

const IDENTITY: SlackUserIdentity = {
  slackUserId: 'U0123456789',
  slackTeamId: 'T0INSTALLED',
  displayName: 'ada',
  email: 'ada@twenty.com',
  canBeMatchedOnEmail: true,
};

describe('resolveSlackRunAsWorkspaceMemberId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findSlackUserMappingWorkspaceMemberIdMock.mockResolvedValue(undefined);
    findWorkspaceMemberIdByEmailMock.mockResolvedValue(undefined);
    createSlackUserMappingMock.mockResolvedValue(undefined);
  });

  it('should return undefined when the Slack user could not be identified', async () => {
    expect(
      await resolveSlackRunAsWorkspaceMemberId({
        client,
        identity: undefined,
      }),
    ).toBeUndefined();
    expect(findSlackUserMappingWorkspaceMemberIdMock).not.toHaveBeenCalled();
  });

  it('should prefer the existing mapping over an email match', async () => {
    findSlackUserMappingWorkspaceMemberIdMock.mockResolvedValue('member-1');

    expect(
      await resolveSlackRunAsWorkspaceMemberId({ client, identity: IDENTITY }),
    ).toBe('member-1');
    expect(findWorkspaceMemberIdByEmailMock).not.toHaveBeenCalled();
    expect(createSlackUserMappingMock).not.toHaveBeenCalled();
  });

  it('should not match on email when the Slack account is not eligible', async () => {
    expect(
      await resolveSlackRunAsWorkspaceMemberId({
        client,
        identity: { ...IDENTITY, canBeMatchedOnEmail: false },
      }),
    ).toBeUndefined();
    expect(findWorkspaceMemberIdByEmailMock).not.toHaveBeenCalled();
  });

  it('should store the mapping when the email matches a single member', async () => {
    findWorkspaceMemberIdByEmailMock.mockResolvedValue('member-1');

    expect(
      await resolveSlackRunAsWorkspaceMemberId({ client, identity: IDENTITY }),
    ).toBe('member-1');
    expect(createSlackUserMappingMock).toHaveBeenCalledWith(client, {
      slackTeamId: 'T0INSTALLED',
      slackUserId: 'U0123456789',
      workspaceMemberId: 'member-1',
      name: 'ada',
    });
  });

  it('should not store a mapping when no member owns the email', async () => {
    expect(
      await resolveSlackRunAsWorkspaceMemberId({ client, identity: IDENTITY }),
    ).toBeUndefined();
    expect(createSlackUserMappingMock).not.toHaveBeenCalled();
  });

  it('should defer to the winning mapping when a concurrent request created one', async () => {
    findWorkspaceMemberIdByEmailMock.mockResolvedValue('member-1');
    createSlackUserMappingMock.mockRejectedValue(new Error('duplicate key'));
    findSlackUserMappingWorkspaceMemberIdMock
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce('member-2');

    expect(
      await resolveSlackRunAsWorkspaceMemberId({ client, identity: IDENTITY }),
    ).toBe('member-2');
  });

  it('should fall back to the agent role when the mapping lookup throws', async () => {
    findSlackUserMappingWorkspaceMemberIdMock.mockRejectedValue(
      new Error('permission denied'),
    );

    expect(
      await resolveSlackRunAsWorkspaceMemberId({
        client,
        identity: { ...IDENTITY, canBeMatchedOnEmail: false },
      }),
    ).toBeUndefined();
  });
});
