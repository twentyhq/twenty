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

export const isProxySignInUrl = (url: URL) =>
  url.hostname.endsWith('.cloudflareaccess.com') ||
  url.hostname
    .split('.')
    .some((label) => SIGN_IN_HOST_LABELS.has(label.toLowerCase())) ||
  url.pathname
    .split('/')
    .some((segment) => SIGN_IN_PATH_SEGMENTS.has(segment.toLowerCase()));
