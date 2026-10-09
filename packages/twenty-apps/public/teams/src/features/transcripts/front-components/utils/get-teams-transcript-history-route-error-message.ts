import { t } from 'twenty-sdk/front-component';

import { TEAMS_TRANSCRIPT_HISTORY_MAX_DAYS } from 'src/features/transcripts/constants/teams-transcript-history-max-days';
import { type TeamsTranscriptHistoryRouteErrorCode } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-route-error-code.type';

export const getTeamsTranscriptHistoryRouteErrorMessage = ({
  errorCode,
  unknownErrorMessage,
}: {
  errorCode: TeamsTranscriptHistoryRouteErrorCode;
  unknownErrorMessage: string;
}): string => {
  switch (errorCode) {
    case 'transcripts-not-enabled':
      return t('Turn on transcripts to import their history.');
    case 'not-connected':
      return t('Connect a Microsoft Teams account first.');
    case 'reconnect-required':
      return t('Reconnect Microsoft Teams in the app settings.');
    case 'invalid-days':
      return t('Enter a whole number of days between 1 and {maxDays}.', {
        maxDays: TEAMS_TRANSCRIPT_HISTORY_MAX_DAYS,
      });
    case 'run-already-active':
      return t('Transcripts are already being counted or imported.');
    case 'count-required':
      return t('Count the transcripts again before importing them.');
    case 'unknown':
      return unknownErrorMessage;
  }
};
