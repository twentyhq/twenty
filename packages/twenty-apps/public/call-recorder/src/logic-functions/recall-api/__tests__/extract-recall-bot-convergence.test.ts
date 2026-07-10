import { describe, expect, it } from 'vitest';

import { extractRecallBotConvergence } from 'src/logic-functions/recall-api/extract-recall-bot-convergence.util';
import { type RecallBotSnapshot } from 'src/logic-functions/recall-api/recall-bot-snapshot.type';

const buildRecallBotSnapshot = (
  overrides: Partial<RecallBotSnapshot> = {},
): RecallBotSnapshot => ({
  id: 'recall-bot-1',
  metadata: {},
  statusChanges: [],
  recordings: [],
  ...overrides,
});

describe('extractRecallBotConvergence', () => {
  it('maps the latest status change code to a call recording status', () => {
    const convergence = extractRecallBotConvergence(
      buildRecallBotSnapshot({
        statusChanges: [
          { code: 'joining_call', createdAt: '2026-01-01T12:58:00.000Z' },
          { code: 'in_call_recording', createdAt: '2026-01-01T13:02:00.000Z' },
          { code: 'call_ended', createdAt: '2026-01-01T14:00:00.000Z' },
          { code: 'done', createdAt: '2026-01-01T14:05:00.000Z' },
        ],
      }),
    );

    // COMPLETED is reserved for full artifact ingestion, never bot state.
    expect(convergence.status).toBe('PROCESSING');
    expect(convergence.isRecallRecordingDone).toBe(true);
  });

  it('uses createdAt to find the latest status when Recall returns status changes out of order', () => {
    const convergence = extractRecallBotConvergence(
      buildRecallBotSnapshot({
        statusChanges: [
          { code: 'done', createdAt: '2026-01-01T14:05:00.000Z' },
          { code: 'joining_call', createdAt: '2026-01-01T12:58:00.000Z' },
          { code: 'in_call_recording', createdAt: '2026-01-01T13:02:00.000Z' },
        ],
      }),
    );

    expect(convergence.status).toBe('PROCESSING');
  });

  it('prefers recording-object timestamps over status change entries', () => {
    const convergence = extractRecallBotConvergence(
      buildRecallBotSnapshot({
        statusChanges: [
          { code: 'in_call_recording', createdAt: '2026-01-01T13:02:30.000Z' },
          { code: 'call_ended', createdAt: '2026-01-01T14:00:30.000Z' },
        ],
        recordings: [
          {
            id: 'recall-recording-1',
            startedAt: '2026-01-01T13:02:00.000Z',
            completedAt: '2026-01-01T14:00:00.000Z',
          },
        ],
      }),
    );

    expect(convergence).toEqual({
      status: 'PROCESSING',
      failureReason: undefined,
      startedAt: '2026-01-01T13:02:00.000Z',
      endedAt: '2026-01-01T14:00:00.000Z',
      externalRecordingId: 'recall-recording-1',
      isRecallRecordingDone: true,
    });
  });

  it('falls back to status change timestamps when recordings carry none', () => {
    const convergence = extractRecallBotConvergence(
      buildRecallBotSnapshot({
        statusChanges: [
          { code: 'in_call_recording', createdAt: '2026-01-01T13:02:00.000Z' },
          { code: 'call_ended', createdAt: '2026-01-01T14:00:00.000Z' },
        ],
        recordings: [
          {
            id: 'recall-recording-1',
            startedAt: undefined,
            completedAt: undefined,
          },
        ],
      }),
    );

    expect(convergence).toEqual({
      status: 'PROCESSING',
      failureReason: undefined,
      startedAt: '2026-01-01T13:02:00.000Z',
      endedAt: '2026-01-01T14:00:00.000Z',
      externalRecordingId: 'recall-recording-1',
      isRecallRecordingDone: false,
    });
  });

  it('normalizes microsecond-precision Recall timestamps to millisecond ISO', () => {
    const convergence = extractRecallBotConvergence(
      buildRecallBotSnapshot({
        statusChanges: [
          { code: 'done', createdAt: '2026-06-10T12:20:00.123456+00:00' },
        ],
        recordings: [
          {
            id: 'recall-recording-1',
            startedAt: '2026-06-10T11:02:28.281597+00:00',
            completedAt: '2026-06-10T12:17:28.281597+00:00',
          },
        ],
      }),
    );

    expect(convergence.startedAt).toBe('2026-06-10T11:02:28.281Z');
    expect(convergence.endedAt).toBe('2026-06-10T12:17:28.281Z');
  });

  it('returns nothing derivable from an empty bot snapshot', () => {
    expect(extractRecallBotConvergence(buildRecallBotSnapshot())).toEqual({
      status: undefined,
      failureReason: undefined,
      startedAt: undefined,
      endedAt: undefined,
      externalRecordingId: undefined,
      isRecallRecordingDone: false,
    });
  });

  it('carries the failing Recall status code as the failure reason', () => {
    const convergence = extractRecallBotConvergence(
      buildRecallBotSnapshot({
        statusChanges: [
          { code: 'joining_call', createdAt: '2026-01-01T12:58:00.000Z' },
          {
            code: 'recording_permission_denied',
            createdAt: '2026-01-01T13:02:00.000Z',
          },
        ],
      }),
    );

    expect(convergence.status).toBe('FAILED');
    expect(convergence.failureReason).toBe('recording_permission_denied');
  });

  it('leaves the status undefined for unknown latest codes', () => {
    const convergence = extractRecallBotConvergence(
      buildRecallBotSnapshot({
        statusChanges: [
          { code: 'in_call_recording', createdAt: '2026-01-01T13:02:00.000Z' },
          { code: 'some_future_code', createdAt: '2026-01-01T13:30:00.000Z' },
        ],
      }),
    );

    expect(convergence.status).toBeUndefined();
    expect(convergence.startedAt).toBe('2026-01-01T13:02:00.000Z');
  });
});
