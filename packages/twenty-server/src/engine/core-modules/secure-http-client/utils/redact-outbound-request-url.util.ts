import { isNonEmptyString } from '@sniptt/guards';

const REDACTED = 'REDACTED';

// A parameter without "=" is redacted whole since the bare value may itself be a token
const redactQueryParameter = (parameter: string): string => {
  const separatorIndex = parameter.indexOf('=');

  return separatorIndex === -1
    ? REDACTED
    : `${parameter.slice(0, separatorIndex)}=${REDACTED}`;
};

// Credentials, query values and fragments never reach the logs; other protocols log as their scheme only
export const redactOutboundRequestUrl = (url: URL): string => {
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return url.protocol;
  }

  const redactedQuery = url.search
    .slice(1)
    .split('&')
    .filter(isNonEmptyString)
    .map(redactQueryParameter)
    .join('&');

  return `${url.protocol}//${url.host}${url.pathname}${
    isNonEmptyString(redactedQuery) ? `?${redactedQuery}` : ''
  }`;
};
