import { RestApiClient } from 'twenty-client-sdk/rest';

import { type TeamsTranscriptHistoryRouteRequest } from 'src/features/transcripts/front-components/types/teams-transcript-history-route-request.type';
import { type TeamsTranscriptHistoryRouteResult } from 'src/features/transcripts/logic-functions/types/teams-transcript-history-route-result.type';

export const postTeamsTranscriptHistoryRouteOrThrow = ({
  routePath,
  body,
}: TeamsTranscriptHistoryRouteRequest): Promise<TeamsTranscriptHistoryRouteResult> =>
  new RestApiClient().post<TeamsTranscriptHistoryRouteResult>(
    `/s${routePath}`,
    body,
  );
