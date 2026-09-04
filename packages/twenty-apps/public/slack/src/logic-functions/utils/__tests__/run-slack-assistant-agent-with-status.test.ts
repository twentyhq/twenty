import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SLACK_ASSISTANT_DEADLINE_ERROR } from 'src/logic-functions/constants/slack-assistant-deadline-error';
import { runSlackAssistantAgentWithStatus } from 'src/logic-functions/utils/run-slack-assistant-agent-with-status';

const runAgentMock = vi.hoisted(() => vi.fn());
const startStatusUpdatesMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', () => ({
  runAgent: runAgentMock,
}));

vi.mock(
  'src/logic-functions/utils/start-slack-assistant-status-updates',
  () => ({
    startSlackAssistantStatusUpdates: startStatusUpdatesMock,
  }),
);

const BASE_INPUT = {
  agentUniversalIdentifier: 'agent-uid',
  runAsWorkspaceMemberId: undefined,
  messages: [{ role: 'user' as const, content: 'hi' }],
  slackChannelId: 'C1',
  threadTimestamp: '1700000000.000100',
};

describe('runSlackAssistantAgentWithStatus', () => {
  beforeEach(() => {
    startStatusUpdatesMock.mockReturnValue(() => Promise.resolve());
    runAgentMock.mockResolvedValue({ result: {}, error: null, success: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should not start the agent or status updates when the deadline has already passed', async () => {
    const result = await runSlackAssistantAgentWithStatus({
      ...BASE_INPUT,
      deadlineAtMs: Date.now() - 1000,
    });

    expect(result).toEqual({
      result: null,
      error: SLACK_ASSISTANT_DEADLINE_ERROR,
      success: false,
    });
    expect(runAgentMock).not.toHaveBeenCalled();
    expect(startStatusUpdatesMock).not.toHaveBeenCalled();
  });

  it('should run the agent when the deadline is still ahead', async () => {
    const result = await runSlackAssistantAgentWithStatus({
      ...BASE_INPUT,
      deadlineAtMs: Date.now() + 60_000,
    });

    expect(result.success).toBe(true);
    expect(runAgentMock).toHaveBeenCalledOnce();
    expect(startStatusUpdatesMock).toHaveBeenCalledOnce();
  });
});
