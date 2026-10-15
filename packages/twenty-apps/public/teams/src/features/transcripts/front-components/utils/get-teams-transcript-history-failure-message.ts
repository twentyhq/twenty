import { t } from 'twenty-sdk/front-component';

import { type TeamsTranscriptHistoryErrorCode } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-error-code.type';

export const getTeamsTranscriptHistoryFailureMessage = (
  errorCode: TeamsTranscriptHistoryErrorCode,
): string => {
  switch (errorCode) {
    case 'reconnect-required':
      return t(
        'The last run stopped because Microsoft Teams must be reconnected. Reconnect it, then count again.',
      );
    case 'transcripts-disabled-by-admin':
      return t(
        'The last run stopped because your Microsoft admin turned off transcript access for apps.',
      );
    case 'page-limit-reached':
      return t(
        'The last run stopped after too many calendar pages. Count fewer days.',
      );
    case 'unknown':
      return t('The last run failed. Count again to retry.');
  }
};
