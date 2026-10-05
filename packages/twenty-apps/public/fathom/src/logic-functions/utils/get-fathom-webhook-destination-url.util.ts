import { FATHOM_WEBHOOK_CONNECTION_QUERY_PARAMETER } from 'src/constants/fathom.constant';
import { FATHOM_WEBHOOK_RESOLVER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const getFathomWebhookDestinationUrl = ({
  apiUrl,
  connectedAccountId,
}: {
  apiUrl: string;
  connectedAccountId: string;
}): string => {
  const destinationUrl = new URL(apiUrl);
  const apiBasePath = destinationUrl.pathname.replace(/\/+$/, '');

  destinationUrl.pathname = `${apiBasePath}/webhooks/server/${FATHOM_WEBHOOK_RESOLVER_UNIVERSAL_IDENTIFIER}`;

  destinationUrl.searchParams.set(
    FATHOM_WEBHOOK_CONNECTION_QUERY_PARAMETER,
    connectedAccountId,
  );

  return destinationUrl.toString();
};
