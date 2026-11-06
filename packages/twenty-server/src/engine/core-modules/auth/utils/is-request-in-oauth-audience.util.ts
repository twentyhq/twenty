import { getUrlSafely, isDefined } from 'twenty-shared/utils';

export const isRequestInOAuthAudience = ({
  audience,
  requestPath,
  requestBaseUrl,
  serverUrl,
}: {
  audience: string;
  requestPath: string;
  requestBaseUrl: string;
  serverUrl: string;
}): boolean =>
  [requestBaseUrl, serverUrl]
    .map((baseUrl) => getUrlSafely(baseUrl)?.origin)
    .filter(isDefined)
    .some((origin) => {
      const requestResource = `${origin}${requestPath}`;

      return (
        requestResource === audience ||
        requestResource.startsWith(`${audience}/`)
      );
    });
