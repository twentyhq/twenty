import { CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resendSyncBroadcastsAndDependenciesHandler } from '@modules/resend/sync/logic-functions/resend-sync-broadcasts-and-dependencies';

const mockSyncTopics = vi.fn();
const mockSyncSegments = vi.fn();
const mockSyncBroadcasts = vi.fn();
const mockGetResendClient = vi.fn();

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(),
}));

vi.mock('@modules/resend/shared/utils/get-resend-client', () => ({
  getResendClient: () => mockGetResendClient(),
}));

vi.mock('@modules/resend/sync/utils/sync-topics', () => ({
  syncTopics: (...args: unknown[]) => mockSyncTopics(...args),
}));

vi.mock('@modules/resend/sync/utils/sync-segments', () => ({
  syncSegments: (...args: unknown[]) => mockSyncSegments(...args),
}));

vi.mock('@modules/resend/sync/utils/sync-broadcasts', () => ({
  syncBroadcasts: (...args: unknown[]) => mockSyncBroadcasts(...args),
}));

const okResult = <T>(value: T) => ({
  result: { fetched: 0, created: 0, updated: 0, errors: [] },
  value,
});

describe('resendSyncBroadcastsAndDependenciesHandler', () => {
  beforeEach(() => {
    mockSyncTopics.mockReset();
    mockSyncSegments.mockReset();
    mockSyncBroadcasts.mockReset();
    mockGetResendClient.mockReset();
    (CoreApiClient as unknown as ReturnType<typeof vi.fn>).mockReset();

    mockGetResendClient.mockReturnValue({});
  });

  it('runs topics → segments → broadcasts in sequence with deadline propagation', async () => {
    const topicMap = new Map([['topic-1', 'twenty-topic-1']]);
    const segmentMap = new Map([['segment-1', 'twenty-segment-1']]);

    mockSyncTopics.mockResolvedValue(okResult(topicMap));
    mockSyncSegments.mockResolvedValue(okResult(segmentMap));
    mockSyncBroadcasts.mockResolvedValue(okResult(undefined));

    const summary = await resendSyncBroadcastsAndDependenciesHandler();

    expect(mockSyncTopics).toHaveBeenCalledTimes(1);
    expect(mockSyncSegments).toHaveBeenCalledTimes(1);
    expect(mockSyncBroadcasts).toHaveBeenCalledTimes(1);

    const broadcastsArgs = mockSyncBroadcasts.mock.calls[0];

    expect(broadcastsArgs).toHaveLength(3);
    expect(broadcastsArgs[2]).toEqual({ deadlineAtMs: expect.any(Number) });

    const topicsArgs = mockSyncTopics.mock.calls[0];

    expect(topicsArgs[3]).toEqual({ deadlineAtMs: expect.any(Number) });

    const segmentsArgs = mockSyncSegments.mock.calls[0];

    expect(segmentsArgs[3]).toEqual({ deadlineAtMs: expect.any(Number) });

    expect(summary.steps.map((s) => s.name)).toEqual([
      'TOPICS',
      'SEGMENTS',
      'BROADCASTS',
    ]);
    expect(summary.steps.map((s) => s.status)).toEqual(['ok', 'ok', 'ok']);
  });

  it('skips broadcasts when topics fails', async () => {
    mockSyncTopics.mockRejectedValue(new Error('topics boom'));
    mockSyncSegments.mockResolvedValue(okResult(new Map()));

    const summary = await resendSyncBroadcastsAndDependenciesHandler();

    expect(mockSyncBroadcasts).not.toHaveBeenCalled();

    const statusByName = new Map(summary.steps.map((s) => [s.name, s.status]));

    expect(statusByName.get('TOPICS')).toBe('failed');
    expect(statusByName.get('BROADCASTS')).toBe('skipped');
  });

  it('skips broadcasts when segments fails', async () => {
    mockSyncTopics.mockResolvedValue(okResult(new Map()));
    mockSyncSegments.mockRejectedValue(new Error('segments boom'));

    const summary = await resendSyncBroadcastsAndDependenciesHandler();

    expect(mockSyncBroadcasts).not.toHaveBeenCalled();

    const statusByName = new Map(summary.steps.map((s) => [s.name, s.status]));

    expect(statusByName.get('SEGMENTS')).toBe('failed');
    expect(statusByName.get('BROADCASTS')).toBe('skipped');
  });
});
