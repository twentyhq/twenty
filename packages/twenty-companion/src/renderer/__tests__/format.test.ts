import { describe, expect, it } from 'vitest';
import { elapsedRecording } from '../format';
import { type ActiveRecording } from '../../shared/types';

const RECORDING: ActiveRecording = {
  id: 'recording',
  windowId: 'window',
  title: 'Call',
  startedAt: '2026-09-07T09:00:00Z',
  status: 'recording',
};
describe('recording duration', () => {
  it('freezes the elapsed time during a pause', () => {
    const paused = {
      ...RECORDING,
      status: 'paused' as const,
      pausedAt: '2026-09-07T09:01:15Z',
    };
    expect(elapsedRecording(paused, Date.parse('2026-09-07T09:10:00Z'))).toBe(
      '01:15',
    );
  });
  it('excludes completed pauses when recording resumes', () => {
    expect(
      elapsedRecording(
        { ...RECORDING, pausedMilliseconds: 60_000 },
        Date.parse('2026-09-07T09:02:15Z'),
      ),
    ).toBe('01:15');
  });
  it('never shows a negative duration after a clock adjustment', () => {
    expect(
      elapsedRecording(RECORDING, Date.parse('2026-09-07T08:59:50Z')),
    ).toBe('00:00');
  });
});
