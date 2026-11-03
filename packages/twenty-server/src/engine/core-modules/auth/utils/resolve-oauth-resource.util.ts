import { ApiPath } from 'twenty-shared/types';
import { getUrlSafely, isDefined } from 'twenty-shared/utils';

const OAUTH_RESOURCE_PATHS = ['', `/${ApiPath.Mcp}`];

export const resolveOAuthResource = ({
  resource,
  requestBaseUrl,
  serverUrl,
}: {
  resource: string;
  requestBaseUrl: string;
  serverUrl: string;
}): string | undefined => {
  const resourceUrl = getUrlSafely(resource);

  if (!isDefined(resourceUrl) || resource.includes('#')) {
    return undefined;
  }

  const origins = [requestBaseUrl, serverUrl].map(
    (baseUrl) => getUrlSafely(baseUrl)?.origin,
  );
  const resourcePath = resourceUrl.pathname.replace(/\/+$/, '');

  if (
    !origins.includes(resourceUrl.origin) ||
    !OAUTH_RESOURCE_PATHS.includes(resourcePath)
  ) {
    return undefined;
  }

  return `${resourceUrl.origin}${resourcePath}`;
};
