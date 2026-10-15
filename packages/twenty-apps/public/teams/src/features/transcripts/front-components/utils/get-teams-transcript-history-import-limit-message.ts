import { t } from 'twenty-sdk/front-component';

import { TEAMS_TRANSCRIPT_HISTORY_MAX_IMPORT_COUNT } from 'src/features/transcripts/constants/teams-transcript-history-max-import-count';
import { formatTeamsTranscriptHistoryCount } from 'src/features/transcripts/front-components/utils/format-teams-transcript-history-count';

export const getTeamsTranscriptHistoryImportLimitMessage = (
  locale: string,
): string =>
  t(
    'You can import up to {maxImportCount} transcripts at a time. Count fewer days, or use the API to import more.',
    {
      maxImportCount: formatTeamsTranscriptHistoryCount({
        count: TEAMS_TRANSCRIPT_HISTORY_MAX_IMPORT_COUNT,
        locale,
      }),
    },
  );
