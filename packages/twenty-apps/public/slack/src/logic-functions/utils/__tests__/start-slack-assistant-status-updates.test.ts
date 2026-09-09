import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  SLACK_ASSISTANT_INITIAL_STATUS,
  SLACK_ASSISTANT_STATUS_STEPS,
} from 'src/logic-functions/constants/slack-assistant-status-steps';
import { startSlackAssistantStatusUpdates } from 'src/logic-functions/utils/start-slack-assistant-status-updates';

const { resolveBestEffortSlackClientMock, setSlackAssistantStatusMock } =
  vi.hoisted(() => ({
    resolveBestEffortSlackClientMock: vi.fn(),
    setSlackAssistantStatusMock: vi.fn().mockResolvedValue(undefined),
  }));

vi.mock('src/logic-functions/utils/resolve-best-effort-slack-client', () => ({
  resolveBestEffortSlackClient: resolveBestEffortSlackClientMock,
}));

vi.mock('src/logic-functions/utils/set-slack-assistant-status', () => ({
  setSlackAssistantStatus: setSlackAssistantStatusMock,
}));

const THREAD = {
  slackChannelId: 'D123',
  threadTimestamp: '1700000000.000100',
};

const SLACK_CLIENT = { assistant: {} };

describe('startSlackAssistantStatusUpdates', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resolveBestEffortSlackClientMock.mockResolvedValue(SLACK_CLIENT);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should set the initial status as soon as the client resolves', async () => {
    const stop = startSlackAssistantStatusUpdates(THREAD);

    await vi.advanceTimersByTimeAsync(0);

    expect(setSlackAssistantStatusMock).toHaveBeenCalledExactlyOnceWith({
      ...THREAD,
      client: SLACK_CLIENT,
      status: SLACK_ASSISTANT_INITIAL_STATUS,
    });

    await stop();
  });

  it('should resolve the Slack client once for every refresh', async () => {
    const stop = startSlackAssistantStatusUpdates(THREAD);

    await vi.runAllTimersAsync();

    const statuses = setSlackAssistantStatusMock.mock.calls.map(
      ([call]) => call.status,
    );

    expect(statuses).toEqual([
      SLACK_ASSISTANT_INITIAL_STATUS,
      ...SLACK_ASSISTANT_STATUS_STEPS.map((step) => step.text),
    ]);
    expect(resolveBestEffortSlackClientMock).toHaveBeenCalledOnce();

    await stop();
  });

  it('should stop future updates once stopped', async () => {
    const stop = startSlackAssistantStatusUpdates(THREAD);

    await vi.advanceTimersByTimeAsync(0);
    await stop();
    vi.runAllTimers();

    expect(setSlackAssistantStatusMock).toHaveBeenCalledTimes(1);
  });

  it('should drop a refresh whose client lookup was still pending when stopped', async () => {
    let resolveClient: (value: unknown) => void = () => undefined;

    resolveBestEffortSlackClientMock.mockReturnValue(
      new Promise((resolve) => {
        resolveClient = resolve;
      }),
    );

    const stop = startSlackAssistantStatusUpdates(THREAD);
    const stopped = stop();

    resolveClient(SLACK_CLIENT);
    await stopped;
    await vi.advanceTimersByTimeAsync(0);

    expect(setSlackAssistantStatusMock).not.toHaveBeenCalled();
  });

  it('should skip every refresh when Slack is not connected', async () => {
    resolveBestEffortSlackClientMock.mockResolvedValue(undefined);

    const stop = startSlackAssistantStatusUpdates(THREAD);

    await vi.runAllTimersAsync();
    await stop();

    expect(setSlackAssistantStatusMock).not.toHaveBeenCalled();
  });

  it('should keep every gap between refreshes under the 2-minute status expiry', () => {
    const stepTimes = [
      0,
      ...SLACK_ASSISTANT_STATUS_STEPS.map((step) => step.afterSeconds),
      240,
    ];

    for (let index = 1; index < stepTimes.length; index++) {
      expect(stepTimes[index] - stepTimes[index - 1]).toBeLessThan(120);
    }
  });
});
