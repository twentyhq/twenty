const SIGN_IN_HOST_LABELS = new Set([
  'auth',
  'authenticate',
  'login',
  'signin',
  'sso',
]);

const SIGN_IN_PATH_SEGMENTS = new Set([
  '.pomerium',
  'auth',
  'authenticate',
  'authorize',
  'login',
  'oauth',
  'oauth2',
  'sign-in',
  'sign_in',
  'signin',
  'sso',
]);

export const isProxySignInUrl = (url: URL) =>
  url.hostname.endsWith('.cloudflareaccess.com') ||
  url.hostname
    .split('.')
    .some((label) => SIGN_IN_HOST_LABELS.has(label.toLowerCase())) ||
  url.pathname
    .split('/')
    .some((segment) => SIGN_IN_PATH_SEGMENTS.has(segment.toLowerCase()));
