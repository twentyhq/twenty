import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchMeetJson } from 'src/logic-functions/utils/fetch-meet-json.util';
import { sleepForMilliseconds } from 'src/logic-functions/utils/sleep-for-milliseconds.util';
import { waitForGoogleWorkspaceEventsOperationOrThrow } from 'src/logic-functions/utils/wait-for-google-workspace-events-operation-or-throw.util';

vi.mock('src/logic-functions/utils/fetch-meet-json.util', () => ({
  fetchMeetJson: vi.fn(),
}));

vi.mock('src/logic-functions/utils/sleep-for-milliseconds.util', () => ({
  sleepForMilliseconds: vi.fn(),
}));

const FINISHED_OPERATION = {
  name: 'operations/first',
  done: true,
  response: { name: 'subscriptions/first' },
};

const UNFINISHED_OPERATION = { name: 'operations/first', done: false };

describe('waitForGoogleWorkspaceEventsOperationOrThrow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a finished operation without asking Google again', async () => {
    await expect(
      waitForGoogleWorkspaceEventsOperationOrThrow({
        accessToken: 'token',
        operation: FINISHED_OPERATION,
        pollCount: 0,
      }),
    ).resolves.toEqual(FINISHED_OPERATION);

    expect(fetchMeetJson).not.toHaveBeenCalled();
  });

  it('should ask Google for an unfinished operation until it is finished', async () => {
    vi.mocked(fetchMeetJson).mockResolvedValue(FINISHED_OPERATION);

    await expect(
      waitForGoogleWorkspaceEventsOperationOrThrow({
        accessToken: 'token',
        operation: UNFINISHED_OPERATION,
        pollCount: 0,
      }),
    ).resolves.toEqual(FINISHED_OPERATION);

    expect(sleepForMilliseconds).toHaveBeenCalledExactlyOnceWith(1000);
    expect(fetchMeetJson).toHaveBeenCalledExactlyOnceWith({
      accessToken: 'token',
      url: 'https://workspaceevents.googleapis.com/v1/operations/first',
    });
  });

  it('should stop after five polls of an operation that never finishes', async () => {
    vi.mocked(fetchMeetJson).mockResolvedValue(UNFINISHED_OPERATION);

    await expect(
      waitForGoogleWorkspaceEventsOperationOrThrow({
        accessToken: 'token',
        operation: UNFINISHED_OPERATION,
        pollCount: 0,
      }),
    ).rejects.toMatchObject({
      message:
        'Google did not finish the event subscription operation operations/first',
      code: 'EVENT_SUBSCRIPTION_FAILED',
    });

    expect(fetchMeetJson).toHaveBeenCalledTimes(5);
  });

  it('should fail for an unfinished operation that cannot be looked up', async () => {
    await expect(
      waitForGoogleWorkspaceEventsOperationOrThrow({
        accessToken: 'token',
        operation: {},
        pollCount: 0,
      }),
    ).rejects.toMatchObject({ code: 'EVENT_SUBSCRIPTION_FAILED' });

    expect(fetchMeetJson).not.toHaveBeenCalled();
  });
});
