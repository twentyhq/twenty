import { describe, expect, it } from 'vitest';

import { getRepresentativeCallRecording } from 'src/front-components/utils/get-representative-call-recording.util';

describe('getRepresentativeCallRecording', () => {
  it('picks the oldest completed recording', () => {
    expect(
      getRepresentativeCallRecording([
        {
          id: 'newer-completed',
          status: 'COMPLETED',
          createdAt: '2026-01-03T10:00:00.000Z',
        },
        {
          id: 'oldest-recording',
          status: 'RECORDING',
          createdAt: '2026-01-01T10:00:00.000Z',
        },
        {
          id: 'older-completed',
          status: 'COMPLETED',
          createdAt: '2026-01-02T10:00:00.000Z',
        },
      ])?.id,
    ).toBe('older-completed');
  });

  it('picks the oldest recording still in progress when none completed', () => {
    expect(
      getRepresentativeCallRecording([
        {
          id: 'failed',
          status: 'FAILED',
          createdAt: '2026-01-01T10:00:00.000Z',
        },
        {
          id: 'newer-processing',
          status: 'PROCESSING',
          createdAt: '2026-01-03T10:00:00.000Z',
        },
        {
          id: 'older-recording',
          status: 'RECORDING',
          createdAt: '2026-01-02T10:00:00.000Z',
        },
      ])?.id,
    ).toBe('older-recording');
  });

  it('returns nothing for no recordings', () => {
    expect(getRepresentativeCallRecording([])).toBeUndefined();
  });
});
