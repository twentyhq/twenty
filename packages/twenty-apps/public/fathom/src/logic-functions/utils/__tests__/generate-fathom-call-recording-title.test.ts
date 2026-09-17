import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FATHOM_MEETING_TOPIC_AGENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { generateFathomCallRecordingTitle } from 'src/logic-functions/utils/generate-fathom-call-recording-title.util';

const runAgentMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/logic-function', () => ({ runAgent: runAgentMock }));

const TITLE_CONTEXT = {
  originalTitle: 'Impromptu Zoom Meeting',
  summary:
    'Custom notes: the team reviewed Acme onboarding blockers and next steps.',
};

describe('generateFathomCallRecordingTitle', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    'Acme onboarding delays and next steps',
    'Northstar Health renewal pricing and timeline',
    'Microsoft Entra ID setup for the customer support team',
  ])(
    'preserves a specific topic without a word-count cutoff: %s',
    async (topic) => {
      runAgentMock.mockResolvedValue({
        success: true,
        result: { response: topic },
      });

      expect(await generateFathomCallRecordingTitle(TITLE_CONTEXT)).toBe(
        `Impromptu Zoom Meeting (${topic})`,
      );
      expect(runAgentMock).toHaveBeenCalledExactlyOnceWith({
        agentUniversalIdentifier:
          FATHOM_MEETING_TOPIC_AGENT_UNIVERSAL_IDENTIFIER,
        prompt: TITLE_CONTEXT.summary,
      });
    },
  );

  it.each([
    null,
    {},
    { response: '' },
    { response: 123 },
    { response: 'NO_TOPIC' },
    { response: 'First line\nSecond line' },
    { response: '(Acme onboarding next steps)' },
    { response: '[Acme onboarding next steps]' },
    { response: 'x'.repeat(81) },
  ])(
    'does not propose a rename for an unusable agent result %j',
    async (result) => {
      runAgentMock.mockResolvedValue({ success: true, result });

      expect(
        await generateFathomCallRecordingTitle(TITLE_CONTEXT),
      ).toBeUndefined();
    },
  );

  it('does not propose a rename when AI is unavailable', async () => {
    runAgentMock.mockResolvedValue({
      success: false,
      result: null,
      error: 'Insufficient credits',
    });

    expect(
      await generateFathomCallRecordingTitle(TITLE_CONTEXT),
    ).toBeUndefined();
  });

  it('uses a background response arriving after the former ten-second deadline', async () => {
    vi.useFakeTimers();
    runAgentMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                success: true,
                result: { response: 'Acme onboarding next steps' },
              }),
            30_000,
          );
        }),
    );

    const title = generateFathomCallRecordingTitle(TITLE_CONTEXT);

    await vi.advanceTimersByTimeAsync(30_000);

    expect(await title).toBe(
      'Impromptu Zoom Meeting (Acme onboarding next steps)',
    );
  });
});
