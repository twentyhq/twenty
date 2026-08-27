import {
  FATHOM_WEBHOOK_CONNECTION_QUERY_PARAMETER,
  FATHOM_WEBHOOK_ROUTE_PATH,
} from 'src/constants/fathom.constant';

export const getFathomWebhookDestinationUrl = ({
  functionsUrl,
  connectedAccountId,
}: {
  functionsUrl: string;
  connectedAccountId: string;
}): string => {
  const destinationUrl = new URL(functionsUrl);
  const functionsBasePath = destinationUrl.pathname.replace(/\/+$/, '');

  destinationUrl.pathname = `${functionsBasePath}${FATHOM_WEBHOOK_ROUTE_PATH}`;

  destinationUrl.searchParams.set(
    FATHOM_WEBHOOK_CONNECTION_QUERY_PARAMETER,
    connectedAccountId,
  );

  return destinationUrl.toString();
};
