import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SLACK_CHANNEL_MODE } from 'src/logic-functions/constants/slack-channel-mode';
import { resolveSlackChannelMode } from 'src/logic-functions/utils/resolve-slack-channel-mode';

const { findSlackChannelRuleMock } = vi.hoisted(() => ({
  findSlackChannelRuleMock: vi.fn(),
}));

vi.mock('src/logic-functions/data/find-slack-channel-rule', () => ({
  findSlackChannelRule: findSlackChannelRuleMock,
}));

const client = {} as CoreApiClient;

describe('resolveSlackChannelMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should default to open when the channel has no rule', async () => {
    findSlackChannelRuleMock.mockResolvedValue(undefined);

    const mode = await resolveSlackChannelMode(client, {
      slackChannelId: 'C1',
    });

    expect(mode).toBe(SLACK_CHANNEL_MODE.OPEN);
  });

  it('should return the mode set on the channel rule', async () => {
    findSlackChannelRuleMock.mockResolvedValue({
      mode: SLACK_CHANNEL_MODE.SILENT,
    });

    const mode = await resolveSlackChannelMode(client, {
      slackChannelId: 'C1',
    });

    expect(mode).toBe(SLACK_CHANNEL_MODE.SILENT);
  });

  it('should fall back to open when the stored mode is not a known one', async () => {
    findSlackChannelRuleMock.mockResolvedValue({ mode: 'RETIRED_MODE' });

    const mode = await resolveSlackChannelMode(client, {
      slackChannelId: 'C1',
    });

    expect(mode).toBe(SLACK_CHANNEL_MODE.OPEN);
  });
});
