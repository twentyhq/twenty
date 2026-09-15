import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SLACK_ASSISTANT_DEADLINE_ERROR } from 'src/logic-functions/constants/slack-assistant-deadline-error';
import { runSlackAssistantAgentWithDeadline } from 'src/logic-functions/utils/run-slack-assistant-agent-with-deadline';

const runAgentMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', () => ({
  runAgent: runAgentMock,
}));

const BASE_INPUT = {
  agentUniversalIdentifier: 'agent-uid',
  runAsWorkspaceMemberId: undefined,
  messages: [{ role: 'user' as const, content: 'hi' }],
};

describe('runSlackAssistantAgentWithDeadline', () => {
  beforeEach(() => {
    runAgentMock.mockResolvedValue({ result: {}, error: null, success: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should not start the agent when the deadline has already passed', async () => {
    const result = await runSlackAssistantAgentWithDeadline({
      ...BASE_INPUT,
      deadlineAtMs: Date.now() - 1000,
    });

    expect(result).toEqual({
      result: null,
      error: SLACK_ASSISTANT_DEADLINE_ERROR,
      success: false,
    });
    expect(runAgentMock).not.toHaveBeenCalled();
  });

  it('should run the agent when the deadline is still ahead', async () => {
    const result = await runSlackAssistantAgentWithDeadline({
      ...BASE_INPUT,
      deadlineAtMs: Date.now() + 60_000,
    });

    expect(result.success).toBe(true);
    expect(runAgentMock).toHaveBeenCalledOnce();
  });
});
