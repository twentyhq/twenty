import { describe, expect, it } from 'vitest';

import { computeCallRecordingCharge } from 'src/logic-functions/domain/compute-call-recording-charge.util';

describe('computeCallRecordingCharge', () => {
  it('charges one credit for a one-hour recording', () => {
    expect(
      computeCallRecordingCharge({
        startedAt: '2026-06-10T09:00:00.000Z',
        endedAt: '2026-06-10T10:00:00.000Z',
      }),
    ).toEqual({
      creditsUsedMicro: 1_000_000,
      quantityMinutes: 60,
    });
  });

  it('prorates partial hours by duration', () => {
    expect(
      computeCallRecordingCharge({
        startedAt: '2026-06-10T09:00:00.000Z',
        endedAt: '2026-06-10T09:45:00.000Z',
      }),
    ).toEqual({
      creditsUsedMicro: 750_000,
      quantityMinutes: 45,
    });
  });

  it('reports at least one minute for very short recordings', () => {
    expect(
      computeCallRecordingCharge({
        startedAt: '2026-06-10T09:00:00.000Z',
        endedAt: '2026-06-10T09:00:30.000Z',
      }),
    ).toEqual({
      creditsUsedMicro: 8_333,
      quantityMinutes: 1,
    });
  });

  it('returns undefined when either timestamp is missing', () => {
    expect(
      computeCallRecordingCharge({
        startedAt: undefined,
        endedAt: '2026-06-10T10:00:00.000Z',
      }),
    ).toBeUndefined();
    expect(
      computeCallRecordingCharge({
        startedAt: '2026-06-10T09:00:00.000Z',
        endedAt: undefined,
      }),
    ).toBeUndefined();
  });

  it('returns undefined for non-positive or unparseable durations', () => {
    expect(
      computeCallRecordingCharge({
        startedAt: '2026-06-10T10:00:00.000Z',
        endedAt: '2026-06-10T09:00:00.000Z',
      }),
    ).toBeUndefined();
    expect(
      computeCallRecordingCharge({
        startedAt: 'not-a-date',
        endedAt: '2026-06-10T10:00:00.000Z',
      }),
    ).toBeUndefined();
  });
});
