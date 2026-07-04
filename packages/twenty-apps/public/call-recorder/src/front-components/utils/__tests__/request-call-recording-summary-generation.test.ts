import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GENERATE_CALL_RECORDING_SUMMARIES_ROUTE_PATH } from 'src/constants/generate-call-recording-summaries-route-path';
import { requestCallRecordingSummaryGeneration } from 'src/front-components/utils/request-call-recording-summary-generation.util';

const enqueueSnackbarMock = vi.hoisted(() => vi.fn());
const postMock = vi.hoisted(() => vi.fn());
const restApiClientMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/front-component', () => ({
  enqueueSnackbar: enqueueSnackbarMock,
}));

vi.mock('twenty-client-sdk/rest', () => ({
  RestApiClient: restApiClientMock,
}));

describe('requestCallRecordingSummaryGeneration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    restApiClientMock.mockImplementation(function RestApiClient() {
      return { post: postMock };
    });
    postMock.mockResolvedValue({
      outcome: 'processed',
      generatedCallRecordingIds: ['call-recording-1'],
      failedCallRecordingIds: [],
      erroredCallRecordingIds: [],
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('posts to the injected functions origin without the legacy prefix', async () => {
    vi.stubEnv('TWENTY_FUNCTIONS_URL', 'https://acme.functions.example.com');

    await requestCallRecordingSummaryGeneration({
      calendarEventIds: ['calendar-event-1'],
    });

    expect(restApiClientMock).toHaveBeenCalledWith({
      baseUrl: 'https://acme.functions.example.com',
    });
    expect(postMock).toHaveBeenCalledWith(
      GENERATE_CALL_RECORDING_SUMMARIES_ROUTE_PATH,
      { calendarEventIds: ['calendar-event-1'] },
    );
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
      erroredCallRecordingIds: [],
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

  it('reports generation errors as failed summaries', async () => {
    postMock.mockResolvedValue({
      outcome: 'processed',
      generatedCallRecordingIds: [],
      failedCallRecordingIds: [],
      erroredCallRecordingIds: ['call-recording-1'],
    });

    await requestCallRecordingSummaryGeneration({
      calendarEventIds: ['calendar-event-1'],
    });

    expect(enqueueSnackbarMock).toHaveBeenCalledWith({
      message: 'Summary generation failed.',
      variant: 'error',
    });
  });
});
