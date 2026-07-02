import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { healCallRecordingsMissingSummary } from 'src/logic-functions/flows/heal-call-recordings-missing-summary.util';

const findCallRecordingIdsMissingSummaryMock = vi.hoisted(() => vi.fn());
const generateCallRecordingSummaryMock = vi.hoisted(() => vi.fn());
const isCallRecordingSummaryEnabledMock = vi.hoisted(() => vi.fn());

vi.mock(
  'src/logic-functions/data/find-call-recording-ids-missing-summary.util',
  () => ({
    findCallRecordingIdsMissingSummary: findCallRecordingIdsMissingSummaryMock,
  }),
);

vi.mock(
  'src/logic-functions/flows/generate-call-recording-summary.util',
  () => ({
    generateCallRecordingSummary: generateCallRecordingSummaryMock,
  }),
);

vi.mock(
  'src/logic-functions/utils/is-call-recording-summary-enabled.util',
  () => ({
    isCallRecordingSummaryEnabled: isCallRecordingSummaryEnabledMock,
  }),
);

const CLIENT: CoreApiClient = Object.assign(
  Object.create(CoreApiClient.prototype),
  {
    mutation: vi.fn(),
    query: vi.fn(),
  },
);

const NOW = new Date('2026-07-02T12:00:00.000Z');

describe('healCallRecordingsMissingSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isCallRecordingSummaryEnabledMock.mockReturnValue(true);
    findCallRecordingIdsMissingSummaryMock.mockResolvedValue([]);
    generateCallRecordingSummaryMock.mockResolvedValue({
      outcome: 'generated',
    });
  });

  it('skips the sweep entirely when summaries are disabled', async () => {
    isCallRecordingSummaryEnabledMock.mockReturnValue(false);

    const result = await healCallRecordingsMissingSummary({
      client: CLIENT,
      now: NOW,
    });

    expect(result).toEqual({
      summarizedCallRecordingIds: [],
      failedSummaryCallRecordingIds: [],
    });
    expect(findCallRecordingIdsMissingSummaryMock).not.toHaveBeenCalled();
  });

  it('excludes recordings updated inside the grace window', async () => {
    await healCallRecordingsMissingSummary({ client: CLIENT, now: NOW });

    expect(findCallRecordingIdsMissingSummaryMock).toHaveBeenCalledWith(
      CLIENT,
      { updatedBefore: '2026-07-02T11:30:00.000Z' },
    );
  });

  it('stops after the agent-run cap so a tick stays inside the timeout', async () => {
    findCallRecordingIdsMissingSummaryMock.mockResolvedValue([
      'call-recording-1',
      'call-recording-2',
      'call-recording-3',
    ]);

    const result = await healCallRecordingsMissingSummary({
      client: CLIENT,
      now: NOW,
    });

    expect(result.summarizedCallRecordingIds).toEqual([
      'call-recording-1',
      'call-recording-2',
    ]);
    expect(generateCallRecordingSummaryMock).toHaveBeenCalledTimes(2);
  });

  it('does not let skipped candidates consume the agent-run cap', async () => {
    findCallRecordingIdsMissingSummaryMock.mockResolvedValue([
      'call-recording-1',
      'call-recording-2',
      'call-recording-3',
    ]);
    generateCallRecordingSummaryMock
      .mockResolvedValueOnce({ outcome: 'no-transcript' })
      .mockResolvedValueOnce({ outcome: 'already-summarized' })
      .mockResolvedValueOnce({ outcome: 'generated' });

    const result = await healCallRecordingsMissingSummary({
      client: CLIENT,
      now: NOW,
    });

    expect(result).toEqual({
      summarizedCallRecordingIds: ['call-recording-3'],
      failedSummaryCallRecordingIds: [],
    });
    expect(generateCallRecordingSummaryMock).toHaveBeenCalledTimes(3);
  });

  it('counts failed agent runs toward the cap and reports them', async () => {
    findCallRecordingIdsMissingSummaryMock.mockResolvedValue([
      'call-recording-1',
      'call-recording-2',
      'call-recording-3',
    ]);
    generateCallRecordingSummaryMock
      .mockResolvedValueOnce({ outcome: 'empty-summary' })
      .mockResolvedValueOnce({ outcome: 'generated' });

    const result = await healCallRecordingsMissingSummary({
      client: CLIENT,
      now: NOW,
    });

    expect(result).toEqual({
      summarizedCallRecordingIds: ['call-recording-2'],
      failedSummaryCallRecordingIds: ['call-recording-1'],
    });
    expect(generateCallRecordingSummaryMock).toHaveBeenCalledTimes(2);
  });

  it('bounds per-tick attempts even when every candidate is skipped', async () => {
    findCallRecordingIdsMissingSummaryMock.mockResolvedValue(
      Array.from({ length: 12 }, (_, index) => `call-recording-${index + 1}`),
    );
    generateCallRecordingSummaryMock.mockResolvedValue({
      outcome: 'no-transcript',
    });

    const result = await healCallRecordingsMissingSummary({
      client: CLIENT,
      now: NOW,
    });

    expect(result).toEqual({
      summarizedCallRecordingIds: [],
      failedSummaryCallRecordingIds: [],
    });
    expect(generateCallRecordingSummaryMock).toHaveBeenCalledTimes(10);
  });
});
