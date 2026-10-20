import { t } from 'twenty-sdk/front-component';

import { TEAMS_GENERATE_CALL_SUMMARIES_MAX_CALL_RECORDINGS } from 'src/features/transcripts/logic-functions/constants/teams-generate-call-summaries-max-call-recordings';
import { type TeamsGenerateCallSummariesResult } from 'src/features/transcripts/logic-functions/types/teams-generate-call-summaries-result.type';

export const getTeamsCallSummariesSnackbar = (
  result: TeamsGenerateCallSummariesResult,
): { message: string; variant: 'success' | 'error' } => {
  if (result.outcome === 'disabled') {
    return {
      message: t('Call summaries are turned off for this workspace.'),
      variant: 'error',
    };
  }

  if (result.outcome === 'too-many-call-recordings') {
    return {
      message: t('Select up to {maxCallRecordingCount} calls at a time.', {
        maxCallRecordingCount:
          TEAMS_GENERATE_CALL_SUMMARIES_MAX_CALL_RECORDINGS,
      }),
      variant: 'error',
    };
  }

  if (result.outcome !== 'processed') {
    return {
      message: t('No Microsoft Teams call recording found.'),
      variant: 'error',
    };
  }

  const summarizedCount = result.summarizedCallRecordingIds.length;
  const failedCount = result.failedCallRecordingIds.length;
  const unavailableCount = result.unavailableCallRecordingIds.length;

  if (summarizedCount > 0 && failedCount > 0) {
    return {
      message: t('Some summaries generated, some failed.'),
      variant: 'error',
    };
  }

  if (summarizedCount > 0 && unavailableCount > 0) {
    return {
      message: t(
        'Some summaries generated, some transcripts could not be summarized.',
      ),
      variant: 'error',
    };
  }

  if (summarizedCount > 0) {
    return { message: t('Summary generated.'), variant: 'success' };
  }

  if (failedCount > 0) {
    return { message: t('Summary generation failed.'), variant: 'error' };
  }

  if (unavailableCount > 0) {
    return {
      message: t('The transcript could not be summarized.'),
      variant: 'error',
    };
  }

  return { message: t('No usable transcript found.'), variant: 'error' };
};
