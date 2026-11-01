import { getAgentChatMessageWorkDurationMs } from '@/ai/utils/getAgentChatMessageWorkDurationMs';

const STARTED_AT = '2026-01-01T10:00:00.000Z';

describe('getAgentChatMessageWorkDurationMs', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T10:00:30.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns the time between start and finish', () => {
    expect(
      getAgentChatMessageWorkDurationMs({
        metadata: {
          createdAt: STARTED_AT,
          startedAt: STARTED_AT,
          finishedAt: '2026-01-01T10:01:23.000Z',
        },
        isStreaming: false,
      }),
    ).toBe(83_000);
  });

  it('measures up to now while the message is still streaming', () => {
    expect(
      getAgentChatMessageWorkDurationMs({
        metadata: { createdAt: STARTED_AT, startedAt: STARTED_AT },
        isStreaming: true,
      }),
    ).toBe(30_000);
  });

  it('returns null when a message stopped streaming without a finish time', () => {
    expect(
      getAgentChatMessageWorkDurationMs({
        metadata: { createdAt: STARTED_AT, startedAt: STARTED_AT },
        isStreaming: false,
      }),
    ).toBeNull();
  });

  it('returns null without a start time', () => {
    expect(
      getAgentChatMessageWorkDurationMs({
        metadata: { createdAt: STARTED_AT },
        isStreaming: true,
      }),
    ).toBeNull();
  });

  it('returns null for a message saved in one go', () => {
    expect(
      getAgentChatMessageWorkDurationMs({
        metadata: {
          createdAt: STARTED_AT,
          startedAt: STARTED_AT,
          finishedAt: '2026-01-01T10:00:00.040Z',
        },
        isStreaming: false,
      }),
    ).toBeNull();
  });
});
