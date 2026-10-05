import { parseTeamsConnectorResponseOrThrow } from 'src/features/chat/logic-functions/utils/parse-teams-connector-response-or-throw';
import { requestTeamsConnector } from 'src/features/chat/logic-functions/utils/request-teams-connector';

type TeamsConnectorRequest = Parameters<typeof requestTeamsConnector>[0];

export const requestTeamsConnectorJson = async <TResponse>(
  request: TeamsConnectorRequest,
): Promise<TResponse> =>
  parseTeamsConnectorResponseOrThrow<TResponse>({
    responseBody: await requestTeamsConnector(request),
    method: request.method,
    path: request.path,
  });
