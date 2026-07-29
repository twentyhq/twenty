import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SLACK_ASSISTANT_PROGRESS_STEPS } from 'src/logic-functions/constants/slack-assistant-progress-steps';
import { startSlackAssistantProgressUpdates } from 'src/logic-functions/utils/start-slack-assistant-progress-updates';

const { slackUpdateMessageHandlerMock } = vi.hoisted(() => ({
  slackUpdateMessageHandlerMock: vi.fn(),
}));

vi.mock('src/logic-functions/handlers/slack-update-message-handler', () => ({
  slackUpdateMessageHandler: slackUpdateMessageHandlerMock,
}));

const CHANNEL_ID = 'C0123456789';
const PLACEHOLDER_TIMESTAMP = '1700000000.000100';

const [firstStep, secondStep] = SLACK_ASSISTANT_PROGRESS_STEPS;

const start = () =>
  startSlackAssistantProgressUpdates({
    slackChannelId: CHANNEL_ID,
    placeholderTimestamp: PLACEHOLDER_TIMESTAMP,
  });

describe('startSlackAssistantProgressUpdates', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    slackUpdateMessageHandlerMock.mockResolvedValue({
      success: true,
      message: 'Slack message updated.',
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not touch the placeholder before the first step is due', async () => {
    const stop = start();

    await vi.advanceTimersByTimeAsync(firstStep.afterSeconds * 1000 - 1);

    expect(slackUpdateMessageHandlerMock).not.toHaveBeenCalled();

    await stop();
  });

  it('should edit the placeholder with each step as it comes due', async () => {
    const stop = start();

    await vi.advanceTimersByTimeAsync(firstStep.afterSeconds * 1000);

    expect(slackUpdateMessageHandlerMock).toHaveBeenCalledWith({
      slackChannelId: CHANNEL_ID,
      messageTimestamp: PLACEHOLDER_TIMESTAMP,
      newMessageText: firstStep.text,
    });

    await vi.advanceTimersByTimeAsync(
      (secondStep.afterSeconds - firstStep.afterSeconds) * 1000,
    );

    expect(slackUpdateMessageHandlerMock).toHaveBeenLastCalledWith({
      slackChannelId: CHANNEL_ID,
      messageTimestamp: PLACEHOLDER_TIMESTAMP,
      newMessageText: secondStep.text,
    });

    await stop();
  });

  it('should stop editing once the run is over', async () => {
    const stop = start();

    await stop();
    await vi.advanceTimersByTimeAsync(
      SLACK_ASSISTANT_PROGRESS_STEPS[SLACK_ASSISTANT_PROGRESS_STEPS.length - 1]
        .afterSeconds * 1000,
    );

    expect(slackUpdateMessageHandlerMock).not.toHaveBeenCalled();
  });

  it('should wait for an in-flight edit so it cannot overwrite the answer', async () => {
    const stop = start();

    slackUpdateMessageHandlerMock.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true }), 50),
        ),
    );

    await vi.advanceTimersByTimeAsync(firstStep.afterSeconds * 1000);

    const stopPromise = stop();
    let isStopped = false;

    void stopPromise.then(() => {
      isStopped = true;
    });

    await vi.advanceTimersByTimeAsync(49);
    expect(isStopped).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await stopPromise;
    expect(isStopped).toBe(true);
  });

  it('should keep going when an edit fails', async () => {
    slackUpdateMessageHandlerMock.mockRejectedValue(new Error('Slack is down'));

    const stop = start();

    await vi.advanceTimersByTimeAsync(secondStep.afterSeconds * 1000);

    expect(slackUpdateMessageHandlerMock).toHaveBeenCalledTimes(2);

    await expect(stop()).resolves.toBeUndefined();
  });
});
