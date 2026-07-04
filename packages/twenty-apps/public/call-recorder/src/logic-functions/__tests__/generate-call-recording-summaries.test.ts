import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type RoutePayload } from 'twenty-sdk/define';

import { generateCallRecordingSummariesHandler } from 'src/logic-functions/generate-call-recording-summaries';

const findCallRecordingIdsMissingSummaryMock = vi.hoisted(() => vi.fn());
const findCallRecordingIdsForCalendarEventsMock = vi.hoisted(() => vi.fn());
const generateMissingCallRecordingSummariesMock = vi.hoisted(() => vi.fn());
const isCallRecordingSummaryEnabledMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(),
}));

vi.mock(
  'src/logic-functions/data/find-call-recording-ids-missing-summary.util',
  () => ({
    findCallRecordingIdsMissingSummary: findCallRecordingIdsMissingSummaryMock,
  }),
);

vi.mock(
  'src/logic-functions/data/find-call-recording-ids-for-calendar-events.util',
  () => ({
    findCallRecordingIdsForCalendarEvents:
      findCallRecordingIdsForCalendarEventsMock,
  }),
);

vi.mock(
  'src/logic-functions/flows/generate-missing-call-recording-summaries.util',
  () => ({
    generateMissingCallRecordingSummaries:
      generateMissingCallRecordingSummariesMock,
  }),
);

vi.mock(
  'src/logic-functions/utils/is-call-recording-summary-enabled.util',
  () => ({
    isCallRecordingSummaryEnabled: isCallRecordingSummaryEnabledMock,
  }),
);

const buildRoutePayload = (
  body: object | null,
): RoutePayload<{ callRecordingIds?: string[]; calendarEventIds?: string[] }> =>
  ({
    body,
    headers: {},
    queryStringParameters: {},
    pathParameters: {},
    isBase64Encoded: false,
    rawBody: undefined,
    requestContext: { http: { method: 'POST', path: '/' } },
    userWorkspaceId: null,
  }) as never;

const BATCH_RESULT = {
  generatedCallRecordingIds: ['call-recording-1'],
  failedCallRecordingIds: [],
  erroredCallRecordingIds: [],
  skippedCallRecordingIds: [],
  remainingCallRecordingIds: [],
  continuationRequested: false,
};

describe('generateCallRecordingSummariesHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isCallRecordingSummaryEnabledMock.mockReturnValue(true);
    findCallRecordingIdsMissingSummaryMock.mockResolvedValue([]);
    findCallRecordingIdsForCalendarEventsMock.mockResolvedValue([]);
    generateMissingCallRecordingSummariesMock.mockResolvedValue(BATCH_RESULT);
  });

  it('returns disabled without touching data when summaries are off', async () => {
    isCallRecordingSummaryEnabledMock.mockReturnValue(false);

    const result = await generateCallRecordingSummariesHandler(
      buildRoutePayload(null),
    );

    expect(result).toEqual({ outcome: 'disabled' });
    expect(findCallRecordingIdsMissingSummaryMock).not.toHaveBeenCalled();
    expect(generateMissingCallRecordingSummariesMock).not.toHaveBeenCalled();
  });

  it('processes explicit call recording ids without sweeping', async () => {
    const result = await generateCallRecordingSummariesHandler(
      buildRoutePayload({ callRecordingIds: ['call-recording-1'] }),
    );

    expect(result).toEqual({ outcome: 'processed', ...BATCH_RESULT });
    expect(generateMissingCallRecordingSummariesMock).toHaveBeenCalledWith(
      expect.objectContaining({ callRecordingIds: ['call-recording-1'] }),
    );
    expect(findCallRecordingIdsMissingSummaryMock).not.toHaveBeenCalled();
    expect(findCallRecordingIdsForCalendarEventsMock).not.toHaveBeenCalled();
  });

  it('resolves calendar event ids to their call recordings', async () => {
    findCallRecordingIdsForCalendarEventsMock.mockResolvedValue([
      'call-recording-7',
    ]);

    await generateCallRecordingSummariesHandler(
      buildRoutePayload({ calendarEventIds: ['calendar-event-1'] }),
    );

    expect(findCallRecordingIdsForCalendarEventsMock).toHaveBeenCalledWith(
      expect.anything(),
      { calendarEventIds: ['calendar-event-1'] },
    );
    expect(generateMissingCallRecordingSummariesMock).toHaveBeenCalledWith(
      expect.objectContaining({ callRecordingIds: ['call-recording-7'] }),
    );
    expect(findCallRecordingIdsMissingSummaryMock).not.toHaveBeenCalled();
  });

  it('reports when the selected calendar events have no recordings instead of sweeping', async () => {
    const result = await generateCallRecordingSummariesHandler(
      buildRoutePayload({ calendarEventIds: ['calendar-event-1'] }),
    );

    expect(result).toEqual({
      outcome: 'no-call-recordings-for-calendar-events',
    });
    expect(findCallRecordingIdsMissingSummaryMock).not.toHaveBeenCalled();
    expect(generateMissingCallRecordingSummariesMock).not.toHaveBeenCalled();
  });

  it('sweeps recordings missing a summary when no ids are given', async () => {
    findCallRecordingIdsMissingSummaryMock.mockResolvedValue([
      'call-recording-1',
      'call-recording-2',
    ]);

    const result = await generateCallRecordingSummariesHandler(
      buildRoutePayload(null),
    );

    expect(findCallRecordingIdsMissingSummaryMock).toHaveBeenCalledWith(
      expect.anything(),
    );
    expect(generateMissingCallRecordingSummariesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        callRecordingIds: ['call-recording-1', 'call-recording-2'],
      }),
    );
    expect(result).toEqual({ outcome: 'processed', ...BATCH_RESULT });
  });

  it('does not sweep when an empty calendar event selection is sent', async () => {
    const result = await generateCallRecordingSummariesHandler(
      buildRoutePayload({ calendarEventIds: [] }),
    );

    expect(result).toEqual({ outcome: 'nothing-selected' });
    expect(findCallRecordingIdsMissingSummaryMock).not.toHaveBeenCalled();
    expect(findCallRecordingIdsForCalendarEventsMock).not.toHaveBeenCalled();
    expect(generateMissingCallRecordingSummariesMock).not.toHaveBeenCalled();
  });

  it('short-circuits an empty sweep without running the batch', async () => {
    const result = await generateCallRecordingSummariesHandler(
      buildRoutePayload({}),
    );

    expect(result).toEqual({ outcome: 'nothing-to-summarize' });
    expect(generateMissingCallRecordingSummariesMock).not.toHaveBeenCalled();
  });
});
