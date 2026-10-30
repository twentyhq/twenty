import { isDefined } from 'twenty-shared/utils';

const getHostname = (redirectUri: string): string | undefined => {
  try {
    return new URL(redirectUri).hostname;
  } catch {
    return undefined;
  }
};

export const getRedirectUriHostnames = (redirectUris: string[]): string[] => [
  ...new Set(redirectUris.map(getHostname).filter(isDefined)),
];
