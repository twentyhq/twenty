import { isNonEmptyString, isString } from '@sniptt/guards';

const SANDBOX_DENYLIST = new Set([
  'allow-same-origin',
  'allow-top-navigation',
  'allow-top-navigation-by-user-activation',
  'allow-top-navigation-to-custom-protocols',
  'allow-popups-to-escape-sandbox',
]);

const DEFAULT_IFRAME_SANDBOX = 'allow-scripts allow-forms allow-popups';

export const sanitizeIframeSandbox = (userSandbox: unknown): string => {
  const requestedTokens = isString(userSandbox)
    ? userSandbox.toLowerCase().split(/\s+/).filter(isNonEmptyString)
    : [];

  if (requestedTokens.length === 0) {
    return DEFAULT_IFRAME_SANDBOX;
  }

  const allowedTokens = new Set(
    requestedTokens.filter((token) => !SANDBOX_DENYLIST.has(token)),
  );

  allowedTokens.add('allow-scripts');

  return Array.from(allowedTokens).join(' ');
};
