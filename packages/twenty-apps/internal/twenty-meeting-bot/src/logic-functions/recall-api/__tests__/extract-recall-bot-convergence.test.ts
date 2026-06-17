import { describe, expect, it } from 'vitest';

import { extractRecallBotConvergence } from 'src/logic-functions/recall-api/extract-recall-bot-convergence.util';

describe('extractRecallBotConvergence', () => {
  it('maps the latest status change code to a call recording status', () => {
    const convergence = extractRecallBotConvergence({
      status_changes: [
        { code: 'joining_call', created_at: '2026-01-01T12:58:00.000Z' },
        { code: 'in_call_recording', created_at: '2026-01-01T13:02:00.000Z' },
        { code: 'call_ended', created_at: '2026-01-01T14:00:00.000Z' },
        { code: 'done', created_at: '2026-01-01T14:05:00.000Z' },
      ],
    });

    // COMPLETED is reserved for full artifact ingestion, never bot state.
    expect(convergence.status).toBe('PROCESSING');
  });

  it('prefers recording-object timestamps over status change entries', () => {
    const convergence = extractRecallBotConvergence({
      status_changes: [
        { code: 'in_call_recording', created_at: '2026-01-01T13:02:30.000Z' },
        { code: 'call_ended', created_at: '2026-01-01T14:00:30.000Z' },
      ],
      recordings: [
        {
          id: 'recall-recording-1',
          started_at: '2026-01-01T13:02:00.000Z',
          completed_at: '2026-01-01T14:00:00.000Z',
        },
      ],
    });

    expect(convergence).toEqual({
      status: 'PROCESSING',
      startedAt: '2026-01-01T13:02:00.000Z',
      endedAt: '2026-01-01T14:00:00.000Z',
      externalRecordingId: 'recall-recording-1',
    });
  });

  it('falls back to status change timestamps when recordings carry none', () => {
    const convergence = extractRecallBotConvergence({
      status_changes: [
        { code: 'in_call_recording', created_at: '2026-01-01T13:02:00.000Z' },
        { code: 'call_ended', created_at: '2026-01-01T14:00:00.000Z' },
      ],
      recordings: [{ id: 'recall-recording-1' }],
    });

    expect(convergence).toEqual({
      status: 'PROCESSING',
      startedAt: '2026-01-01T13:02:00.000Z',
      endedAt: '2026-01-01T14:00:00.000Z',
      externalRecordingId: 'recall-recording-1',
    });
  });

  it('normalizes microsecond-precision Recall timestamps to millisecond ISO', () => {
    const convergence = extractRecallBotConvergence({
      status_changes: [
        { code: 'done', created_at: '2026-06-10T12:20:00.123456+00:00' },
      ],
      recordings: [
        {
          id: 'recall-recording-1',
          started_at: '2026-06-10T11:02:28.281597+00:00',
          completed_at: '2026-06-10T12:17:28.281597+00:00',
        },
      ],
    });

    expect(convergence.startedAt).toBe('2026-06-10T11:02:28.281Z');
    expect(convergence.endedAt).toBe('2026-06-10T12:17:28.281Z');
  });

  it('returns nothing derivable from an empty bot response', () => {
    expect(extractRecallBotConvergence({})).toEqual({
      status: undefined,
      startedAt: undefined,
      endedAt: undefined,
      externalRecordingId: undefined,
    });
  });

  it('skips malformed status change entries', () => {
    const convergence = extractRecallBotConvergence({
      status_changes: [
        null,
        'not-an-object',
        { created_at: '2026-01-01T13:00:00.000Z' },
        { code: 'in_call_recording', created_at: '2026-01-01T13:02:00.000Z' },
      ],
      recordings: 'not-an-array',
    });

    expect(convergence).toEqual({
      status: 'RECORDING',
      startedAt: '2026-01-01T13:02:00.000Z',
      endedAt: undefined,
      externalRecordingId: undefined,
    });
  });

  it('leaves the status undefined for unknown latest codes', () => {
    const convergence = extractRecallBotConvergence({
      status_changes: [
        { code: 'in_call_recording', created_at: '2026-01-01T13:02:00.000Z' },
        { code: 'some_future_code', created_at: '2026-01-01T13:30:00.000Z' },
      ],
    });

    expect(convergence.status).toBeUndefined();
    expect(convergence.startedAt).toBe('2026-01-01T13:02:00.000Z');
  });
});
