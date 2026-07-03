import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GENERATE_CALL_RECORDING_SUMMARIES_ROUTE_PATH } from 'src/constants/generate-call-recording-summaries-route-path';
import { requestCallRecordingSummaryGeneration } from 'src/front-components/utils/request-call-recording-summary-generation.util';

const enqueueSnackbarMock = vi.hoisted(() => vi.fn());
const postMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/front-component', () => ({
  enqueueSnackbar: enqueueSnackbarMock,
}));

vi.mock('twenty-client-sdk/rest', () => ({
  RestApiClient: vi.fn(function RestApiClient() {
    return {
      post: postMock,
    };
  }),
}));

describe('requestCallRecordingSummaryGeneration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    postMock.mockResolvedValue({
      outcome: 'processed',
      generatedCallRecordingIds: ['call-recording-1'],
      failedCallRecordingIds: [],
    });
  });

  it('does nothing when no calendar events are selected', async () => {
    await requestCallRecordingSummaryGeneration({ calendarEventIds: [] });

    expect(postMock).not.toHaveBeenCalled();
    expect(enqueueSnackbarMock).not.toHaveBeenCalled();
  });

  it('reports mixed generation results', async () => {
    postMock.mockResolvedValue({
      outcome: 'processed',
      generatedCallRecordingIds: ['call-recording-1'],
      failedCallRecordingIds: ['call-recording-2'],
    });

    await requestCallRecordingSummaryGeneration({
      calendarEventIds: ['calendar-event-1', 'calendar-event-2'],
    });

    expect(postMock).toHaveBeenCalledWith(
      `/s${GENERATE_CALL_RECORDING_SUMMARIES_ROUTE_PATH}`,
      { calendarEventIds: ['calendar-event-1', 'calendar-event-2'] },
    );
    expect(enqueueSnackbarMock).toHaveBeenCalledWith({
      message: 'Some summaries generated, some failed.',
      variant: 'error',
    });
  });
});
