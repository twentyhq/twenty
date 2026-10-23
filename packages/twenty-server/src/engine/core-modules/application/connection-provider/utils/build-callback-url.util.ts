import { ApiPath } from 'twenty-shared/types';

// Workspace-agnostic by design: the workspace identity travels in the
// signed `state` parameter, so a single redirect URL configured at the
// OAuth provider serves every workspace.
export const buildAppOAuthCallbackUrl = (serverUrl: string): string =>
  new URL(`/${ApiPath.Auth}/apps/callback`, serverUrl).toString();

// the state rides in the URL because the service gets it as both a return URL and a notification URL
export const buildAppCustomConnectionCallbackUrl = ({
  serverUrl,
  state,
}: {
  serverUrl: string;
  state: string;
}): string => {
  const callbackUrl = new URL(
    `/${ApiPath.Auth}/apps/custom/callback`,
    serverUrl,
  );

  callbackUrl.searchParams.set('state', state);

  return callbackUrl.toString();
};
