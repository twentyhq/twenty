import { ApiPath } from 'twenty-shared/types';

// Excludes /webhooks and /auth: components never call them, and their handlers forward request headers to app code.
// /s forwards them too but is how components reach their logic functions; twentyhq/core-team-issues#3128 tracks stripping proxy identity headers.
const PAGE_COOKIE_ELIGIBLE_PATH_PREFIXES = [
  ApiPath.GraphQL,
  ApiPath.Metadata,
  ApiPath.Rest,
  ApiPath.File,
  ApiPath.Files,
  ApiPath.PublicAssets,
  ApiPath.RouteTrigger,
].map((apiPath) => `/${apiPath}`);

// URL parsing keeps these encoded, but a proxy that decodes them can route /rest/..%2Fwebhooks/x to an excluded path.
const ENCODED_PATH_SEPARATOR_PATTERN = /%2f|%5c/i;

export const isPageCookieEligiblePath = (pathname: string): boolean =>
  !ENCODED_PATH_SEPARATOR_PATTERN.test(pathname) &&
  PAGE_COOKIE_ELIGIBLE_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
