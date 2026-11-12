import { getUrlSafely, isDefined } from 'twenty-shared/utils';

const SERVED_OAUTH_RESOURCE_PATHS = ['', '/mcp'];

// RFC 8707: a token must only be issued for a resource this server is, or a client could be made to carry it elsewhere
export const isOAuthResourceServedByOrigins = ({
  resource,
  origins,
}: {
  resource: string;
  origins: string[];
}): boolean => {
  const resourceUrl = getUrlSafely(resource);

  if (
    !isDefined(resourceUrl) ||
    resourceUrl.search !== '' ||
    resourceUrl.hash !== '' ||
    resourceUrl.username !== '' ||
    resourceUrl.password !== ''
  ) {
    return false;
  }

  return (
    SERVED_OAUTH_RESOURCE_PATHS.includes(
      resourceUrl.pathname.replace(/\/$/, ''),
    ) &&
    origins.some(
      (origin) => getUrlSafely(origin)?.origin === resourceUrl.origin,
    )
  );
};
