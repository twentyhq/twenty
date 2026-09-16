import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveSlackChannelAccessPolicy } from 'src/logic-functions/utils/resolve-slack-channel-access-policy';

const { findSlackChannelRuleMock, getSlackAccessModeMock } = vi.hoisted(() => ({
  findSlackChannelRuleMock: vi.fn(),
  getSlackAccessModeMock: vi.fn(),
}));

vi.mock('src/logic-functions/data/find-slack-channel-rule', () => ({
  findSlackChannelRule: findSlackChannelRuleMock,
}));

vi.mock('src/logic-functions/utils/get-slack-access-mode', () => ({
  getSlackAccessMode: getSlackAccessModeMock,
}));

const client = { query: vi.fn() };

const buildRule = (mode: string, capability = 'FULL') => ({
  id: 'rule-1',
  name: 'finance',
  slackChannelId: 'C0FIN',
  slackTeamId: 'T0INSTALLED',
  mode,
  capability,
});

const resolve = (isDirectMessage = false) =>
  resolveSlackChannelAccessPolicy({
    client,
    slackChannelId: 'C0FIN',
    isDirectMessage,
  });

describe('resolveSlackChannelAccessPolicy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findSlackChannelRuleMock.mockResolvedValue(undefined);
    getSlackAccessModeMock.mockResolvedValue('ONLY_LINKED_MEMBERS');
  });

  it('should follow the workspace access mode in a direct message without reading rules', async () => {
    expect(await resolve(true)).toEqual({
      status: 'ANSWER',
      accessMode: 'ONLY_LINKED_MEMBERS',
      capability: 'FULL',
      isChannelRule: false,
    });
    expect(findSlackChannelRuleMock).not.toHaveBeenCalled();
  });

  it('should follow the workspace access mode when the channel has no rule', async () => {
    expect(await resolve()).toEqual({
      status: 'ANSWER',
      accessMode: 'ONLY_LINKED_MEMBERS',
      capability: 'FULL',
      isChannelRule: false,
    });
  });

  it('should silence the channel for a SILENT rule', async () => {
    findSlackChannelRuleMock.mockResolvedValue(buildRule('SILENT'));

    expect(await resolve()).toEqual({ status: 'SILENT' });
    expect(getSlackAccessModeMock).not.toHaveBeenCalled();
  });

  it('should restrict the channel to linked members for a LINKED_MEMBERS_ONLY rule', async () => {
    getSlackAccessModeMock.mockResolvedValue('ANYONE');
    findSlackChannelRuleMock.mockResolvedValue(
      buildRule('LINKED_MEMBERS_ONLY'),
    );

    expect(await resolve()).toEqual({
      status: 'ANSWER',
      accessMode: 'ONLY_LINKED_MEMBERS',
      capability: 'FULL',
      isChannelRule: true,
    });
  });

  it('should open the channel for an OPEN rule even when the workspace is restricted', async () => {
    findSlackChannelRuleMock.mockResolvedValue(buildRule('OPEN'));

    expect(await resolve()).toEqual({
      status: 'ANSWER',
      accessMode: 'ANYONE',
      capability: 'FULL',
      isChannelRule: true,
    });
    expect(getSlackAccessModeMock).not.toHaveBeenCalled();
  });

  it('should carry a read-only cap from the rule into the policy', async () => {
    findSlackChannelRuleMock.mockResolvedValue(buildRule('OPEN', 'READ_ONLY'));

    expect(await resolve()).toEqual({
      status: 'ANSWER',
      accessMode: 'ANYONE',
      capability: 'READ_ONLY',
      isChannelRule: true,
    });
  });

  it('should report an unreadable rule rather than falling back to the workspace mode', async () => {
    findSlackChannelRuleMock.mockRejectedValue(new Error('db down'));

    expect(await resolve()).toEqual({ status: 'UNREADABLE' });
    expect(getSlackAccessModeMock).not.toHaveBeenCalled();
  });
});
