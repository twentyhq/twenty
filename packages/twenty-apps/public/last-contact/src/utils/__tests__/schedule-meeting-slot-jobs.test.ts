import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { enqueueJobsMock } = vi.hoisted(() => ({ enqueueJobsMock: vi.fn() }));
vi.mock('twenty-sdk/logic-function', () => ({
  enqueueJobs: enqueueJobsMock,
}));

import { MEETING_SLOT_REACHED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { scheduleMeetingSlotJobs } from 'src/utils/schedule-meeting-slot-jobs';

const NOW = '2026-06-12T12:00:00.000Z';
const MINUTE_MS = 60 * 1000;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
  enqueueJobsMock.mockReset();
  enqueueJobsMock.mockResolvedValue({ enqueued: true });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('scheduleMeetingSlotJobs', () => {
  it('should enqueue one job per slot, delayed until just after the slot ends', async () => {
    await scheduleMeetingSlotJobs([
      '2026-06-12T12:05:00.000Z',
      '2026-06-12T12:14:59.000Z',
      '2026-06-12T13:30:00.000Z',
    ]);

    expect(enqueueJobsMock).toHaveBeenCalledTimes(2);
    expect(enqueueJobsMock.mock.calls[0][0]).toEqual({
      logicFunctionUniversalIdentifier:
        MEETING_SLOT_REACHED_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      jobs: [
        {
          jobId: `meeting-slot-${Date.parse('2026-06-12T12:00:00.000Z')}`,
          payload: {
            slotStart: '2026-06-12T12:00:00.000Z',
            slotEnd: '2026-06-12T12:15:00.000Z',
          },
        },
      ],
      delayMs: 16 * MINUTE_MS,
      retryLimit: 3,
    });
    expect(enqueueJobsMock.mock.calls[1][0].delayMs).toBe(106 * MINUTE_MS);
  });

  it('should skip started meetings and meetings past the 48 hour horizon', async () => {
    await scheduleMeetingSlotJobs([
      '2026-06-12T11:59:00.000Z',
      NOW,
      '2026-06-14T12:00:01.000Z',
      'not-a-date',
    ]);

    expect(enqueueJobsMock).not.toHaveBeenCalled();
  });
});
