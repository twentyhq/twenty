import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { runTeamsAssistantAgentOrThrow } from 'src/features/chat/logic-functions/utils/run-teams-assistant-agent-or-throw';

const runAgentMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', () => ({
  runAgent: runAgentMock,
}));

const INPUT = {
  requestText: 'how many open deals does Acme have?',
  workspaceMemberId: 'workspace-member-1',
  history: [],
};

describe('runTeamsAssistantAgentOrThrow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    runAgentMock.mockResolvedValue({
      success: true,
      result: { response: '  Acme has 3 open deals.  ' },
      error: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should run the agent as the member and return the trimmed answer', async () => {
    await expect(
      runTeamsAssistantAgentOrThrow({
        ...INPUT,
        deadlineAtMs: Date.now() + 60_000,
      }),
    ).resolves.toBe('Acme has 3 open deals.');

    expect(runAgentMock).toHaveBeenCalledTimes(1);
    expect(runAgentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        runAsWorkspaceMemberId: INPUT.workspaceMemberId,
        messages: [
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining(INPUT.requestText),
          }),
        ],
      }),
    );
  });

  it('should replay earlier turns of the conversation before the request', async () => {
    await runTeamsAssistantAgentOrThrow({
      ...INPUT,
      history: [{ requestText: 'list my companies', responseText: '**Acme**' }],
      deadlineAtMs: Date.now() + 60_000,
    });

    expect(runAgentMock.mock.calls[0][0].messages).toEqual([
      { role: 'user', content: 'list my companies' },
      { role: 'assistant', content: '**Acme**' },
      expect.objectContaining({
        role: 'user',
        content: expect.stringContaining(INPUT.requestText),
      }),
    ]);
  });

  it('should not start the agent when the deadline has already passed', async () => {
    await expect(
      runTeamsAssistantAgentOrThrow({ ...INPUT, deadlineAtMs: Date.now() - 1 }),
    ).rejects.toThrow('Teams deadline passed before the agent could start');

    expect(runAgentMock).not.toHaveBeenCalled();
  });

  it('should give up at the deadline while the agent is still running', async () => {
    let settleAgentRun: (value: unknown) => void = () => undefined;

    runAgentMock.mockReturnValue(
      new Promise((resolve) => {
        settleAgentRun = resolve;
      }),
    );

    const run = runTeamsAssistantAgentOrThrow({
      ...INPUT,
      deadlineAtMs: Date.now() + 1_000,
    });
    const expectation = expect(run).rejects.toThrow(
      'Agent did not answer before the Teams deadline',
    );

    await vi.advanceTimersByTimeAsync(1_000);
    await expectation;

    settleAgentRun({
      success: true,
      result: { response: 'late' },
      error: null,
    });
  });

  it('should throw the agent error when the run fails', async () => {
    runAgentMock.mockResolvedValue({
      success: false,
      result: null,
      error: 'Agent run failed',
    });

    await expect(
      runTeamsAssistantAgentOrThrow({
        ...INPUT,
        deadlineAtMs: Date.now() + 60_000,
      }),
    ).rejects.toThrow('Agent run failed');
  });

  it('should throw when the agent returns no text', async () => {
    runAgentMock.mockResolvedValue({
      success: true,
      result: { response: '   ' },
      error: null,
    });

    await expect(
      runTeamsAssistantAgentOrThrow({
        ...INPUT,
        deadlineAtMs: Date.now() + 60_000,
      }),
    ).rejects.toThrow('Agent returned an empty response');
  });
});
