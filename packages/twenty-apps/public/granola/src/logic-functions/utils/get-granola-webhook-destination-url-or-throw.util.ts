import { GRANOLA_WEBHOOK_RESOLVER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getServerRouteIdentifier } from 'src/logic-functions/utils/get-server-route-identifier.util';

export const getGranolaWebhookDestinationUrlOrThrow = ({
  apiUrl,
  registrationId,
}: {
  apiUrl: string;
  registrationId: string;
}): string => {
  const destinationUrl = new URL(apiUrl);
  if (destinationUrl.protocol !== 'https:') {
    throw new Error('Granola requires a public HTTPS Twenty server URL.');
  }
  destinationUrl.pathname = `${destinationUrl.pathname.replace(/\/+$/, '')}/webhooks/server/${getServerRouteIdentifier(GRANOLA_WEBHOOK_RESOLVER_UNIVERSAL_IDENTIFIER)}`;
  destinationUrl.search = '';
  destinationUrl.hash = '';
  destinationUrl.searchParams.set('registrationId', registrationId);
  return destinationUrl.toString();
};
