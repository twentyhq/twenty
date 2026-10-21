import { isNonEmptyString } from '@sniptt/guards';

import { readConfig } from '@/config/read-config';
import { type RemoteEntry } from '@/config/types/config-file.type';
import { isAccessTokenExpiring } from '@/oauth/is-access-token-expiring';
import { refreshOAuthSession } from '@/oauth/refresh-oauth-session';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { type CliWarning } from '@/output/types/cli-warning.type';
import { TARGET_ENVIRONMENT_VARIABLE } from '@/target/constants/target-environment-variable.constant';
import { parseApiUrl } from '@/target/parse-api-url';
import { selectTarget } from '@/target/select-target';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';

type AuthenticationRecovery = (context: {
  target: ResolvedTarget;
  error: unknown;
}) => Promise<ResolvedTarget>;

const toRemoteTarget = async ({
  remoteName,
  remote,
  configPath,
  signal,
  onAuthenticationRequired,
}: {
  remoteName: string;
  remote: RemoteEntry;
  configPath: string;
  signal: AbortSignal;
  onAuthenticationRequired?: AuthenticationRecovery;
}): Promise<ResolvedTarget> => {
  const accessToken = remote.twentyCLIAccessToken;
  const apiUrl = parseApiUrl({
    rawUrl: remote.apiUrl,
    sourceName: `The URL of remote ${remoteName}`,
  });

  if (isNonEmptyString(accessToken)) {
    const target: ResolvedTarget = {
      apiUrl,
      bearerToken: accessToken,
      credentialKind: 'oauth',
      source: 'remote',
      remoteName,
    };

    if (!isAccessTokenExpiring(accessToken)) {
      return target;
    }

    try {
      return {
        ...target,
        bearerToken: await refreshOAuthSession({
          configPath,
          remoteName,
          apiUrl,
          signal,
        }),
      };
    } catch (error) {
      if (onAuthenticationRequired) {
        return onAuthenticationRequired({ target, error });
      }

      throw error;
    }
  }

  const bearerToken = remote.apiKey;

  if (!isNonEmptyString(bearerToken)) {
    throw new CliError({
      code: 'AUTH_REQUIRED',
      exitCode: EXIT_CODE.AUTHENTICATION,
      message: `Remote ${remoteName} has no saved credentials.`,
      hint: `Sign in: twenty auth login --remote ${remoteName}`,
      details: { remote: remoteName },
    });
  }

  return {
    apiUrl,
    bearerToken,
    credentialKind: 'apiKey',
    source: 'remote',
    remoteName,
  };
};

export const resolveTarget = async ({
  environment,
  remoteFlag,
  configPath,
  signal,
  warn,
  onAuthenticationRequired,
}: {
  environment: NodeJS.ProcessEnv;
  remoteFlag: string | undefined;
  configPath: string;
  signal: AbortSignal;
  warn: (warning: CliWarning) => void;
  onAuthenticationRequired?: AuthenticationRecovery;
}): Promise<ResolvedTarget> => {
  const selection = await selectTarget({
    environment,
    remoteFlag,
    loadConfig: () => readConfig(configPath),
    warn,
  });

  if (selection.source === 'remote') {
    return toRemoteTarget({
      remoteName: selection.remoteName,
      remote: selection.remote,
      configPath,
      signal,
      onAuthenticationRequired,
    });
  }

  return {
    apiUrl: parseApiUrl({
      rawUrl: selection.apiUrl,
      sourceName: TARGET_ENVIRONMENT_VARIABLE.API_URL,
    }),
    bearerToken: selection.apiKey,
    credentialKind: 'apiKey',
    source: 'environment',
  };
};
