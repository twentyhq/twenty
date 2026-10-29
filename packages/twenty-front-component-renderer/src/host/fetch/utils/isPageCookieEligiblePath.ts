import { ApiPath } from 'twenty-shared/types';

// Excludes /s, /webhooks and /auth: their handlers forward request headers to app code,
// and auth proxies inject identity headers (Cf-Access-Jwt-Assertion, X-Goog-IAP-JWT-Assertion) there.
const PAGE_COOKIE_ELIGIBLE_PATH_PREFIXES = [
  ApiPath.GraphQL,
  ApiPath.Metadata,
  ApiPath.Rest,
  ApiPath.File,
  ApiPath.Files,
  ApiPath.PublicAssets,
].map((apiPath) => `/${apiPath}`);

export const isPageCookieEligiblePath = (pathname: string): boolean =>
  PAGE_COOKIE_ELIGIBLE_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
