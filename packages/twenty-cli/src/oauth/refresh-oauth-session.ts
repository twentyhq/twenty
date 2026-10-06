import { isNonEmptyString } from '@sniptt/guards';

import { getCredentialKind } from '@/config/get-credential-kind';
import { readConfig } from '@/config/read-config';
import { type ConfigFile } from '@/config/types/config-file.type';
import { withConfigLock } from '@/config/with-config-lock';
import { writeConfigAtomically } from '@/config/write-config-atomically';
import { discoverOAuthServer } from '@/oauth/discover-oauth-server';
import { isAccessTokenExpiring } from '@/oauth/is-access-token-expiring';
import { requestOAuthTokens } from '@/oauth/request-oauth-tokens';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { parseApiUrl } from '@/target/parse-api-url';

const createSessionExpiredError = (remoteName: string, details?: unknown) =>
  new CliError({
    code: 'AUTH_REQUIRED',
    exitCode: EXIT_CODE.AUTHENTICATION,
    message: `Your session on ${remoteName} expired and could not be refreshed.`,
    hint: `Sign in again: twenty auth login --remote ${remoteName}`,
    details: { remote: remoteName, refresh: details ?? null },
  });

const createChangedRemoteError = (remoteName: string, change: string) =>
  new CliError({
    code: 'CONFLICT',
    exitCode: EXIT_CODE.CONFLICT,
    message: `Remote ${remoteName} ${change} while this command was waiting to refresh its session. Nothing was sent.`,
    hint: 'Run the command again.',
    details: { remote: remoteName },
  });

const readUnchangedRemote = ({
  config,
  remoteName,
  apiUrl,
}: {
  config: ConfigFile;
  remoteName: string;
  apiUrl: string;
}) => {
  if (!Object.hasOwn(config.remotes, remoteName)) {
    throw createChangedRemoteError(remoteName, 'was renamed or removed');
  }

  const remote = config.remotes[remoteName];

  if (
    parseApiUrl({ rawUrl: remote.apiUrl, sourceName: remoteName }) !== apiUrl
  ) {
    throw createChangedRemoteError(remoteName, 'was pointed at another server');
  }

  const credentialKind = getCredentialKind(remote);

  if (credentialKind === 'apiKey') {
    throw createChangedRemoteError(remoteName, 'switched to an API key');
  }

  if (credentialKind === 'none') {
    throw new CliError({
      code: 'AUTH_REQUIRED',
      exitCode: EXIT_CODE.AUTHENTICATION,
      message: `Remote ${remoteName} was signed out while this command was waiting.`,
      hint: `Sign in again: twenty auth login --remote ${remoteName}`,
      details: { remote: remoteName },
    });
  }

  return remote;
};

export const refreshOAuthSession = ({
  configPath,
  remoteName,
  apiUrl,
  signal,
}: {
  configPath: string;
  remoteName: string;
  apiUrl: string;
  signal: AbortSignal;
}) =>
  withConfigLock({
    configPath,
    signal,
    operation: async () => {
      const config = await readConfig(configPath);
      const remote = readUnchangedRemote({ config, remoteName, apiUrl });
      const {
        twentyCLIAccessToken: accessToken,
        twentyCLIRefreshToken: refreshToken,
        twentyCLIRegistrationClientId: clientId,
      } = remote;

      if (
        isNonEmptyString(accessToken) &&
        !isAccessTokenExpiring(accessToken)
      ) {
        return accessToken;
      }

      if (!isNonEmptyString(refreshToken) || !isNonEmptyString(clientId)) {
        throw createSessionExpiredError(remoteName);
      }

      const { tokenEndpoint } = await discoverOAuthServer({ apiUrl, signal });
      const tokens = await requestOAuthTokens({
        apiUrl,
        tokenEndpoint,
        parameters: {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: clientId,
        },
        signal,
      }).catch((error: unknown) => {
        if (error instanceof CliError && error.code === 'OAUTH_FAILED') {
          throw createSessionExpiredError(remoteName, error.details);
        }

        throw error;
      });

      signal.throwIfAborted();
      await writeConfigAtomically(configPath, {
        ...config,
        remotes: {
          ...config.remotes,
          [remoteName]: {
            ...remote,
            twentyCLIAccessToken: tokens.accessToken,
            ...(isNonEmptyString(tokens.refreshToken)
              ? { twentyCLIRefreshToken: tokens.refreshToken }
              : {}),
          },
        },
      });

      return tokens.accessToken;
    },
  });
