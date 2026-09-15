import { beforeEach, describe, expect, it, vi } from 'vitest';

import { findSlackChannelRule } from 'src/logic-functions/data/find-slack-channel-rule';

const SLACK_CHANNEL_ID = 'C0ENG';

const queryMock = vi.fn();

const client = { query: queryMock };

const buildQueryResult = (node: Record<string, unknown> | undefined) => ({
  slackChannelRules: { edges: node === undefined ? [] : [{ node }] },
});

const buildNode = (overrides: Record<string, unknown> = {}) => ({
  id: 'rule-1',
  name: 'eng',
  slackChannelId: SLACK_CHANNEL_ID,
  slackTeamId: 'T0INSTALLED',
  mode: 'SILENT',
  ...overrides,
});

const find = () =>
  findSlackChannelRule(client, { slackChannelId: SLACK_CHANNEL_ID });

describe('findSlackChannelRule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryMock.mockResolvedValue(buildQueryResult(buildNode()));
  });

  it('should return the stored rule', async () => {
    expect(await find()).toEqual({
      id: 'rule-1',
      name: 'eng',
      slackChannelId: SLACK_CHANNEL_ID,
      slackTeamId: 'T0INSTALLED',
      mode: 'SILENT',
    });
    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        slackChannelRules: expect.objectContaining({
          __args: expect.objectContaining({
            filter: { slackChannelId: { eq: SLACK_CHANNEL_ID } },
          }),
        }),
      }),
    );
  });

  it('should return undefined when the channel has no rule', async () => {
    queryMock.mockResolvedValue(buildQueryResult(undefined));

    expect(await find()).toBeUndefined();
  });

  it('should refuse a mode it cannot interpret rather than reading it as open', async () => {
    queryMock.mockResolvedValue(
      buildQueryResult(buildNode({ mode: 'READ_ONLY' })),
    );

    await expect(find()).rejects.toThrow(
      'Slack channel rule rule-1 has an unsupported mode "READ_ONLY"',
    );
  });
});
