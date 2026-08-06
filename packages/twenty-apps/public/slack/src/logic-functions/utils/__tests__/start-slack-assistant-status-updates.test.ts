import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  SLACK_ASSISTANT_INITIAL_STATUS,
  SLACK_ASSISTANT_STATUS_STEPS,
} from 'src/logic-functions/constants/slack-assistant-status-steps';
import { startSlackAssistantStatusUpdates } from 'src/logic-functions/utils/start-slack-assistant-status-updates';

const setSlackAssistantStatusMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue(undefined),
);

vi.mock('src/logic-functions/utils/set-slack-assistant-status', () => ({
  setSlackAssistantStatus: setSlackAssistantStatusMock,
}));

const THREAD = {
  slackChannelId: 'D123',
  threadTimestamp: '1700000000.000100',
};

describe('startSlackAssistantStatusUpdates', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should set the initial status immediately', () => {
    const stop = startSlackAssistantStatusUpdates(THREAD);

    expect(setSlackAssistantStatusMock).toHaveBeenCalledExactlyOnceWith({
      ...THREAD,
      status: SLACK_ASSISTANT_INITIAL_STATUS,
    });

    return stop();
  });

  it('should walk through every status step in order', async () => {
    const stop = startSlackAssistantStatusUpdates(THREAD);

    vi.runAllTimers();

    const statuses = setSlackAssistantStatusMock.mock.calls.map(
      ([call]) => call.status,
    );

    expect(statuses).toEqual([
      SLACK_ASSISTANT_INITIAL_STATUS,
      ...SLACK_ASSISTANT_STATUS_STEPS.map((step) => step.text),
    ]);

    await stop();
  });

  it('should stop future updates once stopped', async () => {
    const stop = startSlackAssistantStatusUpdates(THREAD);

    await stop();
    vi.runAllTimers();

    expect(setSlackAssistantStatusMock).toHaveBeenCalledTimes(1);
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
