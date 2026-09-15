import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SLACK_ASSISTANT_DEADLINE_ERROR } from 'src/logic-functions/constants/slack-assistant-deadline-error';
import { raceSlackAssistantAgentDeadline } from 'src/logic-functions/utils/race-slack-assistant-agent-deadline';

const AGENT_RESULT = {
  result: { text: 'Acme has 3 open deals' },
  error: null,
  success: true,
};

describe('raceSlackAssistantAgentDeadline', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return the agent result when the agent finishes first', async () => {
    const race = raceSlackAssistantAgentDeadline({
      agentRun: Promise.resolve(AGENT_RESULT),
      deadlineAtMs: Date.now() + 10_000,
    });

    await expect(race).resolves.toEqual(AGENT_RESULT);
  });

  it('should return a failed result when the deadline passes first', async () => {
    const race = raceSlackAssistantAgentDeadline({
      agentRun: new Promise(() => undefined),
      deadlineAtMs: Date.now() + 10_000,
    });

    await vi.advanceTimersByTimeAsync(10_000);

    await expect(race).resolves.toEqual({
      result: null,
      error: SLACK_ASSISTANT_DEADLINE_ERROR,
      success: false,
    });
  });

  it('should not resolve before the deadline while the agent is still running', async () => {
    let isSettled = false;

    const race = raceSlackAssistantAgentDeadline({
      agentRun: new Promise(() => undefined),
      deadlineAtMs: Date.now() + 10_000,
    }).then((result) => {
      isSettled = true;

      return result;
    });

    await vi.advanceTimersByTimeAsync(9_999);

    expect(isSettled).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await race;

    expect(isSettled).toBe(true);
  });

  it('should fail immediately when the deadline has already passed', async () => {
    const race = raceSlackAssistantAgentDeadline({
      agentRun: new Promise(() => undefined),
      deadlineAtMs: Date.now() - 5_000,
    });

    await vi.advanceTimersByTimeAsync(0);

    await expect(race).resolves.toEqual({
      result: null,
      error: SLACK_ASSISTANT_DEADLINE_ERROR,
      success: false,
    });
  });

  it('should leave no pending deadline timer once the agent has answered', async () => {
    await raceSlackAssistantAgentDeadline({
      agentRun: Promise.resolve(AGENT_RESULT),
      deadlineAtMs: Date.now() + 10_000,
    });

    expect(vi.getTimerCount()).toBe(0);
  });

  it('should surface an agent rejection rather than waiting for the deadline', async () => {
    const race = raceSlackAssistantAgentDeadline({
      agentRun: Promise.reject(new Error('Agent blew up')),
      deadlineAtMs: Date.now() + 10_000,
    });

    await expect(race).rejects.toThrow('Agent blew up');
  });
});
