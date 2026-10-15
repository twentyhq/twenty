import { type TEAMS_TRANSCRIPT_HISTORY_COUNT_ROUTE_PATH } from 'src/features/transcripts/constants/teams-transcript-history-count-route-path';
import { type TEAMS_TRANSCRIPT_HISTORY_IMPORT_ROUTE_PATH } from 'src/features/transcripts/constants/teams-transcript-history-import-route-path';
import { type TEAMS_TRANSCRIPT_HISTORY_STATUS_ROUTE_PATH } from 'src/features/transcripts/constants/teams-transcript-history-status-route-path';

export type TeamsTranscriptHistoryRouteRequest =
  | {
      routePath: typeof TEAMS_TRANSCRIPT_HISTORY_STATUS_ROUTE_PATH;
      body: Record<string, never>;
    }
  | {
      routePath: typeof TEAMS_TRANSCRIPT_HISTORY_COUNT_ROUTE_PATH;
      body: { days: number };
    }
  | {
      routePath: typeof TEAMS_TRANSCRIPT_HISTORY_IMPORT_ROUTE_PATH;
      body: { runId: string };
    };
