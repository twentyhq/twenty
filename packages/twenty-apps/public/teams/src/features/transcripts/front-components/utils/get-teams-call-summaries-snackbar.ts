import { t } from 'twenty-sdk/front-component';

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

  if (result.outcome !== 'processed') {
    return {
      message: t('No Microsoft Teams call recording found.'),
      variant: 'error',
    };
  }

  const summarizedCount = result.summarizedCallRecordingIds.length;
  const failedCount = result.failedCallRecordingIds.length;

  if (summarizedCount > 0 && failedCount > 0) {
    return {
      message: t('Some summaries generated, some failed.'),
      variant: 'error',
    };
  }

  if (summarizedCount > 0) {
    return { message: t('Summary generated.'), variant: 'success' };
  }

  if (failedCount > 0) {
    return { message: t('Summary generation failed.'), variant: 'error' };
  }

  if (result.unavailableCallRecordingIds.length > 0) {
    return {
      message: t('The transcript could not be summarized.'),
      variant: 'error',
    };
  }

  return { message: t('No usable transcript found.'), variant: 'error' };
};
