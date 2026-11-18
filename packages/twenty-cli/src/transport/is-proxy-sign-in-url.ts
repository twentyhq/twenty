const SIGN_IN_KEYWORDS = ['auth', 'authenticate', 'login', 'signin', 'sso'];

const SIGN_IN_HOST_LABELS = new Set(SIGN_IN_KEYWORDS);

const SIGN_IN_PATH_SEGMENTS = new Set([
  ...SIGN_IN_KEYWORDS,
  '.pomerium',
  'authorize',
  'oauth',
  'oauth2',
  'sign-in',
  'sign_in',
]);

const hasSignInPath = (url: URL) =>
  url.pathname
    .split('/')
    .some((segment) => SIGN_IN_PATH_SEGMENTS.has(segment.toLowerCase()));

const hasSignInHost = (url: URL) =>
  url.hostname.endsWith('.cloudflareaccess.com') ||
  url.hostname
    .split('.')
    .some((label) => SIGN_IN_HOST_LABELS.has(label.toLowerCase()));

// On the API's own origin the host says nothing, so only the path counts.
export const isProxySignInUrl = ({
  url,
  requestOrigin,
}: {
  url: URL;
  requestOrigin: string;
}) =>
  hasSignInPath(url) || (url.origin !== requestOrigin && hasSignInHost(url));
