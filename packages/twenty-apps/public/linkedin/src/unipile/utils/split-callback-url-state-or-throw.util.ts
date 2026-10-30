import { isNonEmptyString } from '@sniptt/guards';

export const splitCallbackUrlStateOrThrow = (
  callbackUrl: string,
): { redirectUri: string; state: string } => {
  const url = new URL(callbackUrl);
  const state = url.searchParams.get('state');

  if (!isNonEmptyString(state)) {
    throw new Error('Connection callback URL has no state');
  }

  url.searchParams.delete('state');

  return { redirectUri: url.toString(), state };
};
