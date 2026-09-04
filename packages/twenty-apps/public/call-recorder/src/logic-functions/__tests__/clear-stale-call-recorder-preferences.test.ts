import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  clearStaleCallRecorderPreferences: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class CoreApiClient {},
}));

vi.mock(
  'src/logic-functions/flows/clear-stale-call-recorder-preferences.util',
  () => ({
    clearStaleCallRecorderPreferences: mocks.clearStaleCallRecorderPreferences,
  }),
);

import clearStaleCallRecorderPreferencesLogicFunction, {
  clearStaleCallRecorderPreferencesHandler,
} from 'src/logic-functions/clear-stale-call-recorder-preferences';

describe('clear-stale-call-recorder-preferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is configured as an enqueue-only job', () => {
    expect(clearStaleCallRecorderPreferencesLogicFunction.config).toEqual(
      expect.objectContaining({
        name: 'clear-stale-call-recorder-preferences',
        timeoutSeconds: 900,
      }),
    );
    expect(
      clearStaleCallRecorderPreferencesLogicFunction.config,
    ).not.toHaveProperty('cronTriggerSettings');
    expect(
      clearStaleCallRecorderPreferencesLogicFunction.config,
    ).not.toHaveProperty('databaseEventTriggerSettings');
  });

  it('returns the cleanup result', async () => {
    mocks.clearStaleCallRecorderPreferences.mockResolvedValue({
      endedCalendarEventCount: 3,
      clearedCalendarEventCount: 2,
    });

    await expect(clearStaleCallRecorderPreferencesHandler()).resolves.toEqual({
      endedCalendarEventCount: 3,
      clearedCalendarEventCount: 2,
    });
  });

  it('rethrows a failure as retryable so the queue redelivers it', async () => {
    mocks.clearStaleCallRecorderPreferences.mockRejectedValue(
      new Error('Network failed'),
    );

    await expect(
      clearStaleCallRecorderPreferencesHandler(),
    ).rejects.toMatchObject({
      name: 'RetryableLogicFunctionError',
      message: expect.stringContaining('Network failed'),
    });
  });
});
