import { stat } from 'node:fs/promises';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { readConfig } from '@/config/read-config';
import { CONFIG_FILE_MODE } from '@/config/constants/config-file-mode.constant';
import { type ConfigFile } from '@/config/types/config-file.type';
import { type DoctorCheck } from '@/doctor/types/doctor-check.type';
import { getMetadataDoctorFailure } from '@/doctor/get-metadata-doctor-failure';
import { getAccessTokenExpiry } from '@/oauth/is-access-token-expiring';
import { CliError } from '@/output/cli-error';
import { TARGET_ENVIRONMENT_VARIABLE } from '@/target/constants/target-environment-variable.constant';
import { parseApiUrl } from '@/target/parse-api-url';
import { selectTarget } from '@/target/select-target';
import { toPublicTarget } from '@/target/to-public-target';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';
import { fetchSignedInIdentity } from '@/transport/metadata/fetch-signed-in-identity';

export const getConnectionDoctorChecks = async ({
  configPath,
  environment,
  remoteFlag,
  offline,
  signal,
}: {
  configPath: string;
  environment: NodeJS.ProcessEnv;
  remoteFlag: string | undefined;
  offline: boolean;
  signal: AbortSignal;
}): Promise<DoctorCheck[]> => {
  const checks: DoctorCheck[] = [];
  let config: ConfigFile | undefined;
  let configError: unknown;

  signal.throwIfAborted();

  try {
    config = await readConfig(configPath);
    checks.push({
      id: 'configuration',
      status: 'pass',
      message: `CLI configuration checked at ${configPath}.`,
      details: {
        path: configPath,
        remoteCount: Object.keys(config.remotes).length,
        defaultRemote: config.defaultRemote ?? null,
      },
    });

    if (process.platform !== 'win32') {
      const configStats = await stat(configPath).catch(() => undefined);

      if (isDefined(configStats) && (configStats.mode & 0o077) !== 0) {
        checks.push({
          id: 'configuration-permissions',
          status: 'warning',
          message: 'Other users may access the CLI configuration file.',
          hint: `Review its permissions; ${CONFIG_FILE_MODE.PRIVATE_FILE.toString(8)} is the expected mode. Doctor does not change them.`,
        });
      }
    }
  } catch (error) {
    configError = error;
    checks.push({
      id: 'configuration',
      status: 'fail',
      code: error instanceof CliError ? error.code : 'INVALID_CONFIG',
      message:
        error instanceof CliError
          ? error.message
          : 'The CLI configuration is unreadable or invalid.',
      hint:
        error instanceof CliError
          ? error.hint
          : `Check ${configPath}. Doctor does not overwrite it.`,
    });
  }

  let target: ResolvedTarget;

  try {
    const selection = await selectTarget({
      environment,
      remoteFlag,
      loadConfig: async () => {
        if (!isDefined(config)) {
          throw configError;
        }

        return config;
      },
      warn: (warning) =>
        checks.push({
          id: 'target-precedence',
          status: 'warning',
          code: warning.code,
          message: warning.message,
        }),
    });
    const apiUrl = parseApiUrl({
      rawUrl:
        selection.source === 'remote'
          ? selection.remote.apiUrl
          : selection.apiUrl,
      sourceName:
        selection.source === 'remote'
          ? `The URL of remote ${selection.remoteName}`
          : TARGET_ENVIRONMENT_VARIABLE.API_URL,
    });
    const publicTarget = {
      apiUrl,
      source: selection.source,
      remote: selection.source === 'remote' ? selection.remoteName : null,
    };

    checks.push({
      id: 'target',
      status: 'pass',
      message: `Selected ${apiUrl} from ${selection.source}.`,
      details: publicTarget,
    });

    const accessToken =
      selection.source === 'remote'
        ? selection.remote.twentyCLIAccessToken
        : undefined;
    const credentialKind = isNonEmptyString(accessToken) ? 'oauth' : 'apiKey';
    const apiKey =
      selection.source === 'remote'
        ? selection.remote.apiKey
        : selection.apiKey;
    const bearerToken = isNonEmptyString(accessToken) ? accessToken : apiKey;

    if (!isNonEmptyString(bearerToken)) {
      checks.push({
        id: 'credentials',
        status: 'fail',
        code: 'AUTH_REQUIRED',
        message: 'The selected remote has no saved credentials.',
        hint: 'Sign in with twenty auth login, then rerun doctor.',
      });

      return [
        ...checks,
        {
          id: 'metadata-api',
          status: 'skipped',
          message: 'No credentials are available.',
        },
      ];
    }

    const expiry =
      credentialKind === 'oauth'
        ? getAccessTokenExpiry(bearerToken)
        : undefined;

    if (isDefined(expiry) && expiry <= Date.now()) {
      const canAttemptRenewal =
        selection.source === 'remote' &&
        isNonEmptyString(selection.remote.twentyCLIRefreshToken);

      checks.push({
        id: 'credentials',
        status: canAttemptRenewal ? 'warning' : 'fail',
        code: 'AUTH_REQUIRED',
        message: canAttemptRenewal
          ? 'The OAuth access token has expired. A refresh token is saved, but renewal has not been verified.'
          : 'The saved OAuth access token has expired and no refresh token is available.',
        hint: 'Run twenty auth status with the same remote to refresh the session, or sign in again. Doctor does not refresh credentials.',
      });

      return [
        ...checks,
        {
          id: 'metadata-api',
          status: 'skipped',
          message: 'The access token has expired.',
        },
      ];
    }

    target = {
      apiUrl,
      source: selection.source,
      ...(selection.source === 'remote'
        ? { remoteName: selection.remoteName }
        : {}),
      credentialKind,
      bearerToken,
    };
    checks.push({
      id: 'credentials',
      status: 'pass',
      message: `${credentialKind === 'oauth' ? 'OAuth token' : 'API key'} configured; acceptance is checked separately.`,
      details: { kind: credentialKind },
    });
  } catch (error) {
    signal.throwIfAborted();

    const code = error instanceof CliError ? error.code : 'INTERNAL_ERROR';

    checks.push({
      id: 'target',
      status: code === 'TARGET_REQUIRED' ? 'skipped' : 'fail',
      code,
      message:
        error instanceof CliError
          ? error.message
          : 'Could not select a workspace.',
      hint: error instanceof CliError ? error.hint : undefined,
    });

    return [
      ...checks,
      {
        id: 'credentials',
        status: 'skipped',
        message: 'No workspace was selected.',
      },
      {
        id: 'metadata-api',
        status: 'skipped',
        message: 'No workspace was selected.',
      },
    ];
  }

  if (offline) {
    return [
      ...checks,
      {
        id: 'metadata-api',
        status: 'skipped',
        message: 'Network checks disabled by --offline.',
      },
    ];
  }

  try {
    signal.throwIfAborted();
    await fetchSignedInIdentity({ target, signal });
    checks.push({
      id: 'metadata-api',
      status: 'pass',
      message: 'The metadata endpoint accepted the configured credentials.',
      details: { ...toPublicTarget(target) },
    });
  } catch (error) {
    signal.throwIfAborted();

    checks.push(getMetadataDoctorFailure(error));
  }

  return checks;
};
