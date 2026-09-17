import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { generateFathomCallRecordingTitle } from 'src/logic-functions/utils/generate-fathom-call-recording-title.util';

const runAgentMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', () => ({ runAgent: runAgentMock }));

const MEETING = {
  recordingId: 123,
  recordingStartTime: new Date('2026-09-17T20:00:00+05:30'),
  meetingTitle: 'Impromptu Zoom Meeting',
  title: 'Impromptu Zoom Meeting',
  defaultSummary: {
    templateName: 'general',
    markdownFormatted:
      'The team reviewed Acme onboarding blockers and agreed on next steps.',
  },
};
const FALLBACK_TITLE = 'Impromptu Zoom Meeting (17 Sept 2026, 14:30 UTC)';

describe('generateFathomCallRecordingTitle', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    runAgentMock.mockResolvedValue({
      success: true,
      result: { response: 'Acme onboarding next steps' },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    'Impromptu',
    'Impromptu meeting',
    'Impromptu Zoom Meeting',
    'Impromptu Google Meet Meeting',
    'Impromptu Microsoft Teams Meeting',
    'Impromptu Slack Huddle',
    'impromptu zoom call',
  ])('appends a summary topic while preserving %s', async (title) => {
    expect(
      await generateFathomCallRecordingTitle({
        ...MEETING,
        title,
        meetingTitle: title,
      }),
    ).toBe(`${title} (Acme onboarding next steps)`);
  });

  it.each([
    'Acme onboarding delays and next steps',
    'Northstar Health renewal pricing and timeline',
    'Microsoft Entra ID setup for the customer support team',
  ])(
    'keeps a specific topic without a word-count cutoff: %s',
    async (topic) => {
      runAgentMock.mockResolvedValue({
        success: true,
        result: { response: topic },
      });

      expect(await generateFathomCallRecordingTitle(MEETING)).toBe(
        `Impromptu Zoom Meeting (${topic})`,
      );
    },
  );

  it.each(['Acme onboarding review', 'Impromptu product strategy review'])(
    'keeps the meaningful title %s without running the agent',
    async (meetingTitle) => {
      expect(
        await generateFathomCallRecordingTitle({ ...MEETING, meetingTitle }),
      ).toBe(meetingTitle);
      expect(runAgentMock).not.toHaveBeenCalled();
    },
  );

  it('keeps a renamed Fathom recording when the calendar title is generic', async () => {
    expect(
      await generateFathomCallRecordingTitle({
        ...MEETING,
        title: 'Acme onboarding review',
      }),
    ).toBe('Acme onboarding review');
    expect(runAgentMock).not.toHaveBeenCalled();
  });

  it('uses the recording title when there is no calendar title', async () => {
    expect(
      await generateFathomCallRecordingTitle({
        ...MEETING,
        meetingTitle: null,
        title: '  Impromptu Zoom Meeting  ',
      }),
    ).toBe('Impromptu Zoom Meeting (Acme onboarding next steps)');
  });

  it.each([undefined, null, { templateName: null, markdownFormatted: '  ' }])(
    'uses the recording time in UTC when the summary is %j',
    async (defaultSummary) => {
      expect(
        await generateFathomCallRecordingTitle({ ...MEETING, defaultSummary }),
      ).toBe(FALLBACK_TITLE);
      expect(runAgentMock).not.toHaveBeenCalled();
    },
  );

  it('falls back when the agent cannot identify a useful topic', async () => {
    runAgentMock.mockResolvedValue({
      success: true,
      result: { response: 'NO_TOPIC' },
    });

    expect(await generateFathomCallRecordingTitle(MEETING)).toBe(
      FALLBACK_TITLE,
    );
  });

  it.each([
    null,
    {},
    { response: '' },
    { response: 123 },
    { response: 'First line\nSecond line' },
    { response: '(Acme onboarding next steps)' },
    { response: '[Acme onboarding next steps]' },
    { response: 'x'.repeat(81) },
  ])('uses the fallback for an unusable agent result %j', async (result) => {
    runAgentMock.mockResolvedValue({ success: true, result });

    expect(await generateFathomCallRecordingTitle(MEETING)).toBe(
      FALLBACK_TITLE,
    );
  });

  it('uses the fallback when AI is unavailable', async () => {
    runAgentMock.mockResolvedValue({
      success: false,
      result: null,
      error: 'Insufficient credits',
    });

    expect(await generateFathomCallRecordingTitle(MEETING)).toBe(
      FALLBACK_TITLE,
    );
  });

  it('uses the fallback when the agent request fails', async () => {
    runAgentMock.mockRejectedValue(new Error('Service unavailable'));

    expect(await generateFathomCallRecordingTitle(MEETING)).toBe(
      FALLBACK_TITLE,
    );
  });

  it('stops waiting for a stalled agent so the recording can be saved', async () => {
    vi.useFakeTimers();
    runAgentMock.mockReturnValue(new Promise(() => {}));

    const title = generateFathomCallRecordingTitle(MEETING);

    await vi.advanceTimersByTimeAsync(10_000);

    expect(await title).toBe(FALLBACK_TITLE);
    expect(vi.getTimerCount()).toBe(0);
  });
});
