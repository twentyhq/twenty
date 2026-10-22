import { RestApiClient } from 'twenty-client-sdk/rest';
import { enqueueSnackbar, t } from 'twenty-sdk/front-component';

import { TEAMS_GENERATE_CALL_SUMMARIES_ROUTE_PATH } from 'src/features/transcripts/constants/teams-generate-call-summaries-route-path';
import { getTeamsCallSummariesSnackbar } from 'src/features/transcripts/front-components/utils/get-teams-call-summaries-snackbar';
import { type TeamsGenerateCallSummariesResult } from 'src/features/transcripts/logic-functions/types/teams-generate-call-summaries-result.type';

export const requestTeamsCallSummaries = async (
  selection: { callRecordingIds: string[] } | { calendarEventIds: string[] },
): Promise<void> => {
  try {
    const result =
      await new RestApiClient().post<TeamsGenerateCallSummariesResult>(
        `/s${TEAMS_GENERATE_CALL_SUMMARIES_ROUTE_PATH}`,
        selection,
      );

    await enqueueSnackbar(getTeamsCallSummariesSnackbar(result));
  } catch {
    await enqueueSnackbar({
      message: t('Summary generation failed.'),
      variant: 'error',
    });
  }
};
