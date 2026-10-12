import { isDefined } from 'twenty-shared/utils';

import { type RemoteEntry } from '@/config/types/config-file.type';
import { type RemoteCredentials } from '@/config/types/remote-credentials.type';

export const replaceRemoteCredentials = ({
  remote,
  credentials,
}: {
  remote: RemoteEntry;
  credentials: RemoteCredentials;
}): RemoteEntry => {
  const {
    apiKey: _apiKey,
    twentyCLIAccessToken: _accessToken,
    twentyCLIRefreshToken: _refreshToken,
    twentyCLIRegistrationClientId: _clientId,
    ...preservedFields
  } = remote;

  return {
    ...preservedFields,
    ...(credentials.kind === 'apiKey'
      ? { apiKey: credentials.apiKey }
      : {
          twentyCLIAccessToken: credentials.accessToken,
          twentyCLIRegistrationClientId: credentials.clientId,
          ...(isDefined(credentials.refreshToken)
            ? { twentyCLIRefreshToken: credentials.refreshToken }
            : {}),
        }),
  };
};
