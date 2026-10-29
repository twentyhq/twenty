import { FATHOM_WEBHOOK_CONNECTION_QUERY_PARAMETER } from 'src/constants/fathom.constant';
import { FATHOM_WEBHOOK_RESOLVER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getServerRouteUrl } from 'src/logic-functions/utils/get-server-route-url.util';

export const getFathomWebhookDestinationUrl = ({
  apiUrl,
  connectedAccountId,
}: {
  apiUrl: string;
  connectedAccountId: string;
}): string => {
  const destinationUrl = getServerRouteUrl({
    apiUrl,
    logicFunctionUniversalIdentifier:
      FATHOM_WEBHOOK_RESOLVER_UNIVERSAL_IDENTIFIER,
  });

  destinationUrl.searchParams.set(
    FATHOM_WEBHOOK_CONNECTION_QUERY_PARAMETER,
    connectedAccountId,
  );

  return destinationUrl.toString();
};
