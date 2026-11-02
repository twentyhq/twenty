import { GRANOLA_WEBHOOK_RESOLVER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getServerRouteUrl } from 'src/logic-functions/utils/get-server-route-url.util';

export const getGranolaWebhookDestinationUrlOrThrow = ({
  apiUrl,
  registrationId,
}: {
  apiUrl: string;
  registrationId: string;
}): string => {
  const destinationUrl = getServerRouteUrl({
    apiUrl,
    logicFunctionUniversalIdentifier:
      GRANOLA_WEBHOOK_RESOLVER_UNIVERSAL_IDENTIFIER,
  });
  if (destinationUrl.protocol !== 'https:') {
    throw new Error('Granola requires a public HTTPS Twenty server URL.');
  }
  destinationUrl.search = '';
  destinationUrl.hash = '';
  destinationUrl.searchParams.set('registrationId', registrationId);
  return destinationUrl.toString();
};
