import { TEAMS_TRANSCRIPTS_WEBHOOK_RESOLVER_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';
import { TEAMS_TRANSCRIPTS_WEBHOOK_CONNECTION_QUERY_PARAMETER } from 'src/features/transcripts/logic-functions/constants/teams-transcripts-webhook-connection-query-parameter';
import { getServerRouteUrl } from 'src/utils/get-server-route-url';

export const buildTeamsTranscriptsWebhookUrl = ({
  apiUrl,
  connectedAccountId,
}: {
  apiUrl: string;
  connectedAccountId: string;
}): string => {
  const webhookUrl = getServerRouteUrl({
    apiUrl,
    logicFunctionUniversalIdentifier:
      TEAMS_TRANSCRIPTS_WEBHOOK_RESOLVER_UNIVERSAL_IDENTIFIER,
  });

  webhookUrl.searchParams.set(
    TEAMS_TRANSCRIPTS_WEBHOOK_CONNECTION_QUERY_PARAMETER,
    connectedAccountId,
  );

  return webhookUrl.toString();
};
