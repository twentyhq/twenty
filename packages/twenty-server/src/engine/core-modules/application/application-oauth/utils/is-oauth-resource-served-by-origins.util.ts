import { isNonEmptyString } from '@sniptt/guards';
import { getUrlSafely, isDefined } from 'twenty-shared/utils';

import { OAUTH_PROTECTED_RESOURCE_PATHS } from 'src/engine/core-modules/application/application-oauth/constants/oauth-protected-resource-paths.constant';

const SERVED_OAUTH_RESOURCE_PATHS: string[] = Object.values(
  OAUTH_PROTECTED_RESOURCE_PATHS,
);

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
    isNonEmptyString(resourceUrl.search) ||
    isNonEmptyString(resourceUrl.hash) ||
    isNonEmptyString(resourceUrl.username) ||
    isNonEmptyString(resourceUrl.password)
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
