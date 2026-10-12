import { isDefined } from 'twenty-shared/utils';

import { getCredentialKind } from '@/config/get-credential-kind';
import { readConfig } from '@/config/read-config';
import { replaceRemoteCredentials } from '@/config/replace-remote-credentials';
import { type ConfigFile } from '@/config/types/config-file.type';
import { updateConfig } from '@/config/update-config';
import { confirmInTerminal } from '@/input/confirm-in-terminal';
import { signInWithBrowser } from '@/oauth/sign-in-with-browser';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { type Output } from '@/output/types/output.type';
import { parseApiUrl } from '@/target/parse-api-url';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';
import { fetchSignedInIdentity } from '@/transport/metadata/fetch-signed-in-identity';

const readUnchangedRemote = (
  config: ConfigFile,
  target: ResolvedTarget,
  remoteName: string,
) => {
  const remote = Object.hasOwn(config.remotes, remoteName)
    ? config.remotes[remoteName]
    : undefined;

  if (
    !isDefined(remote) ||
    getCredentialKind(remote) !== 'oauth' ||
    remote.twentyCLIAccessToken !== target.bearerToken ||
    parseApiUrl({ rawUrl: remote.apiUrl, sourceName: remoteName }) !==
      target.apiUrl
  ) {
    throw new CliError({
      code: 'CONFLICT',
      exitCode: EXIT_CODE.CONFLICT,
      message: `Remote ${remoteName} changed while signing in again. No credentials were saved.`,
      hint: 'Run the command again.',
    });
  }

  return remote;
};

export const signInToRemoteAgain = async ({
  target,
  remoteName,
  error,
  configPath,
  output,
  signal,
}: {
  target: ResolvedTarget;
  remoteName: string;
  error: CliError;
  configPath: string;
  output: Output;
  signal: AbortSignal;
}): Promise<ResolvedTarget> => {
  readUnchangedRemote(await readConfig(configPath), target, remoteName);

  if (
    !(await confirmInTerminal({
      question: `Your session on ${remoteName} is no longer valid. Sign in again now?`,
      signal,
    }))
  ) {
    throw error;
  }

  const credentials = await signInWithBrowser({
    apiUrl: target.apiUrl,
    output,
    signal,
  });
  const signedInTarget = { ...target, bearerToken: credentials.accessToken };

  await fetchSignedInIdentity({ target: signedInTarget, signal });
  await updateConfig({
    configPath,
    signal,
    update: (config) => {
      const remote = readUnchangedRemote(config, target, remoteName);

      return {
        result: undefined,
        config: {
          ...config,
          remotes: {
            ...config.remotes,
            [remoteName]: replaceRemoteCredentials({
              remote,
              credentials: { kind: 'oauth', ...credentials },
            }),
          },
        },
      };
    },
  });

  return signedInTarget;
};
