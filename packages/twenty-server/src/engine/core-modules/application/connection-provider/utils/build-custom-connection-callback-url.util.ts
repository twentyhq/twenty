import { ApiPath } from 'twenty-shared/types';

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
