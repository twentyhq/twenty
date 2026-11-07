import { isNonEmptyString } from '@sniptt/guards';

// TODO(@charlesBochet): delete once the app's twenty-sdk ships getServerRouteUrl.
export const getServerRouteUrl = ({
  apiUrl,
  logicFunctionUniversalIdentifier,
}: {
  apiUrl: string;
  logicFunctionUniversalIdentifier: string;
}): URL => {
  const serverRoutesUrl = process.env.TWENTY_SERVER_ROUTES_URL;
  const serverRouteUrl = new URL(
    isNonEmptyString(serverRoutesUrl) ? serverRoutesUrl : apiUrl,
  );
  const basePath = serverRouteUrl.pathname.replace(/\/+$/, '');

  serverRouteUrl.pathname = isNonEmptyString(serverRoutesUrl)
    ? `${basePath}/${logicFunctionUniversalIdentifier}`
    : `${basePath}/webhooks/server/${logicFunctionUniversalIdentifier}`;

  return serverRouteUrl;
};
