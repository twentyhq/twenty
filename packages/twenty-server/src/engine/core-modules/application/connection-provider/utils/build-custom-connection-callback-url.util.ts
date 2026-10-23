import { ApiPath } from 'twenty-shared/types';

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
