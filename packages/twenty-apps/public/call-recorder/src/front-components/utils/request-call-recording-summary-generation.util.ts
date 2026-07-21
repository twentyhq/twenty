import { RestApiClient } from 'twenty-client-sdk/rest';
import { enqueueSnackbar } from 'twenty-sdk/front-component';

import { GENERATE_CALL_RECORDING_SUMMARIES_ROUTE_PATH } from 'src/constants/generate-call-recording-summaries-route-path';

type GenerateSummariesResponse = {
  outcome?: string;
  generatedCallRecordingIds?: string[];
  failedCallRecordingIds?: string[];
  erroredCallRecordingIds?: string[];
};

const buildSnackbarForResponse = (
  response: GenerateSummariesResponse,
): { message: string; variant: 'success' | 'error' } => {
  const generatedCallRecordingCount = (response.generatedCallRecordingIds ?? [])
    .length;
  const failedCallRecordingCount =
    (response.failedCallRecordingIds ?? []).length +
    (response.erroredCallRecordingIds ?? []).length;

  if (response.outcome === 'disabled') {
    return {
      message: 'Call summaries are disabled for this workspace.',
      variant: 'error',
    };
  }

  if (response.outcome === 'no-call-recordings-for-calendar-events') {
    return {
      message: 'No call recording found for this event.',
      variant: 'error',
    };
  }

  if (generatedCallRecordingCount > 0 && failedCallRecordingCount > 0) {
    return {
      message: 'Some summaries generated, some failed.',
      variant: 'error',
    };
  }

  if (generatedCallRecordingCount > 0) {
    return { message: 'Summary generated.', variant: 'success' };
  }

  if (failedCallRecordingCount > 0) {
    return { message: 'Summary generation failed.', variant: 'error' };
  }

  return {
    message: 'No summary to generate for this event.',
    variant: 'success',
  };
};

export const requestCallRecordingSummaryGeneration = async ({
  calendarEventIds,
}: {
  calendarEventIds: string[];
}): Promise<void> => {
  if (calendarEventIds.length === 0) {
    return;
  }

  try {
    const response = await new RestApiClient().post<GenerateSummariesResponse>(
      `/s${GENERATE_CALL_RECORDING_SUMMARIES_ROUTE_PATH}`,
      { calendarEventIds },
    );

    await enqueueSnackbar(buildSnackbarForResponse(response ?? {}));
  } catch {
    await enqueueSnackbar({
      message: 'Summary generation failed.',
      variant: 'error',
    });
  }
};
