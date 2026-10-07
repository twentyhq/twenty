import { isDefined } from 'twenty-shared/utils';

import {
  readBooleanOption,
  readStringOption,
} from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { readApiKeyFromStandardInput } from '@/commands/auth/login/read-api-key-from-standard-input';
import { getConfigPath } from '@/config/get-config-path';
import { readConfig } from '@/config/read-config';
import { replaceRemoteCredentials } from '@/config/replace-remote-credentials';
import { type RemoteCredentials } from '@/config/types/remote-credentials.type';
import {
  type ConfigFile,
  type RemoteEntry,
} from '@/config/types/config-file.type';
import { updateConfig } from '@/config/update-config';
import { validateRemoteName } from '@/config/validate-remote-name';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { dimText, formatSuccessLine } from '@/output/style';
import { parseApiUrl } from '@/target/parse-api-url';
import { signInWithBrowser } from '@/oauth/sign-in-with-browser';
import { type OutputMode } from '@/output/types/output-mode.type';
import { type Output } from '@/output/types/output.type';
import { isInteractionAllowed } from '@/program/is-interaction-allowed';
import { fetchSignedInIdentity } from '@/transport/metadata/fetch-signed-in-identity';

const findExistingRemote = (config: ConfigFile, remoteName: string) =>
  Object.hasOwn(config.remotes, remoteName)
    ? config.remotes[remoteName]
    : undefined;

const assertSameUrlOrReplace = ({
  existingRemote,
  remoteName,
  apiUrl,
  replace,
}: {
  existingRemote: RemoteEntry | undefined;
  remoteName: string;
  apiUrl: string;
  replace: boolean;
}) => {
  if (
    !isDefined(existingRemote) ||
    replace ||
    parseApiUrl({ rawUrl: existingRemote.apiUrl, sourceName: remoteName }) ===
      apiUrl
  ) {
    return;
  }

  throw new CliError({
    code: 'CONFIRMATION_REQUIRED',
    exitCode: EXIT_CODE.USAGE,
    message: `Remote ${remoteName} points to ${existingRemote.apiUrl}.`,
    hint: `Pass --replace to point it at ${apiUrl}.`,
  });
};

const obtainCredentials = async ({
  options,
  apiUrl,
  output,
  outputMode,
  signal,
}: {
  options: Record<string, unknown>;
  apiUrl: string;
  output: Output;
  outputMode: OutputMode;
  signal: AbortSignal;
}): Promise<RemoteCredentials> => {
  if (readBooleanOption(options, 'withToken')) {
    return {
      kind: 'apiKey',
      apiKey: await readApiKeyFromStandardInput(signal),
    };
  }

  if (!isInteractionAllowed({ options, outputMode })) {
    throw new CliError({
      code: 'USAGE',
      exitCode: EXIT_CODE.USAGE,
      message:
        'Browser sign-in only runs in an interactive terminal, not with --no-input, JSON output, redirected stdin or in CI.',
      hint: 'In scripts and CI, retry this command with --with-token and pipe an API key on standard input.',
    });
  }

  return {
    kind: 'oauth',
    ...(await signInWithBrowser({ apiUrl, output, signal })),
  };
};

const formatSignedIn = ({
  remoteName,
  apiUrl,
  credentials,
  identity,
}: {
  remoteName: string;
  apiUrl: string;
  credentials: RemoteCredentials;
  identity: { workspaceName: string | null; email: string | null };
}) => {
  const workspace = isDefined(identity.workspaceName)
    ? ` · workspace ${identity.workspaceName}`
    : '';

  return credentials.kind === 'apiKey'
    ? `Saved remote "${remoteName}" ${dimText(`(${apiUrl}) · API key${workspace}`)}`
    : `Signed in to "${remoteName}"${isDefined(identity.email) ? ` as ${identity.email}` : ''}${dimText(workspace)}`;
};

export const runAuthLoginCommand: CommandRun = async ({
  options,
  output,
  outputMode,
  signal,
}) => {
  const remoteNameOption =
    readStringOption(options, 'name') ?? readStringOption(options, 'remote');
  const remoteName = validateRemoteName(remoteNameOption ?? 'default');
  const replace = readBooleanOption(options, 'replace');
  const configPath = getConfigPath();
  const config = await readConfig(configPath);
  const existingRemote = findExistingRemote(config, remoteName);
  const urlOption = readStringOption(options, 'url');

  if (!isDefined(urlOption) && !isDefined(existingRemote)) {
    throw new CliError({
      code: 'USAGE',
      exitCode: EXIT_CODE.USAGE,
      message:
        Object.keys(config.remotes).length === 0
          ? 'No saved connections yet.'
          : `There is no remote named "${remoteName}" yet.`,
      hint: !isDefined(remoteNameOption)
        ? 'Run twenty auth login --url <url> to save a connection.'
        : 'Pass --url to create it.',
    });
  }

  const apiUrl = isDefined(urlOption)
    ? parseApiUrl({ rawUrl: urlOption, sourceName: '--url' })
    : parseApiUrl({
        rawUrl: existingRemote?.apiUrl ?? '',
        sourceName: `The URL of remote ${remoteName}`,
      });

  assertSameUrlOrReplace({ existingRemote, remoteName, apiUrl, replace });

  const credentials = await obtainCredentials({
    options,
    apiUrl,
    output,
    outputMode,
    signal,
  });
  const identity = await fetchSignedInIdentity({
    target: {
      apiUrl,
      bearerToken:
        credentials.kind === 'apiKey'
          ? credentials.apiKey
          : credentials.accessToken,
      credentialKind: credentials.kind,
      source: 'remote',
      remoteName,
    },
    signal,
  }).catch((error: unknown) => {
    if (error instanceof CliError && error.code === 'AUTH_REQUIRED') {
      throw new CliError({
        code: 'AUTH_REQUIRED',
        exitCode: EXIT_CODE.AUTHENTICATION,
        message: `${apiUrl} rejected ${credentials.kind === 'apiKey' ? 'this API key' : 'the new session'}. Nothing was saved.`,
        hint:
          credentials.kind === 'apiKey'
            ? 'Check the key and that it belongs to a workspace on this server.'
            : 'Run twenty auth login again.',
        details: error.details,
      });
    }

    throw error;
  });

  const isDefault = await updateConfig({
    configPath,
    signal,
    update: (config) => {
      const latestRemote = findExistingRemote(config, remoteName);

      assertSameUrlOrReplace({
        existingRemote: latestRemote,
        remoteName,
        apiUrl,
        replace,
      });

      const hasUsableDefault =
        isDefined(config.defaultRemote) &&
        Object.hasOwn(config.remotes, config.defaultRemote);
      const defaultRemote =
        readBooleanOption(options, 'use') || !hasUsableDefault
          ? remoteName
          : config.defaultRemote;

      return {
        result: defaultRemote === remoteName,
        config: {
          ...config,
          defaultRemote,
          remotes: {
            ...config.remotes,
            [remoteName]: {
              ...replaceRemoteCredentials({
                remote: latestRemote ?? { apiUrl },
                credentials,
              }),
              apiUrl,
              ...(isDefined(identity.workspaceName)
                ? { workspaceName: identity.workspaceName }
                : {}),
            },
          },
        },
      };
    },
  });

  return {
    data: {
      remote: remoteName,
      apiUrl,
      credentials: credentials.kind,
      workspaceName: identity.workspaceName,
      email: identity.email,
      isDefault,
    },
    human: formatSuccessLine(
      formatSignedIn({ remoteName, apiUrl, credentials, identity }),
    ),
  };
};
