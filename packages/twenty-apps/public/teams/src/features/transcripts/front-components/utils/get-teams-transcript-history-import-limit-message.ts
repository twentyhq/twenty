import { t } from 'twenty-sdk/front-component';

import { TEAMS_TRANSCRIPT_HISTORY_MAX_IMPORT_COUNT } from 'src/features/transcripts/constants/teams-transcript-history-max-import-count';

export const getTeamsTranscriptHistoryImportLimitMessage = (): string =>
  t(
    'You can import up to {maxImportCount} transcripts at a time. Count fewer days, or use the API to import more.',
    { maxImportCount: TEAMS_TRANSCRIPT_HISTORY_MAX_IMPORT_COUNT },
  );
