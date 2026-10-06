import { readStringOption } from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { getConfigPath } from '@/config/get-config-path';
import { getCredentialKind } from '@/config/get-credential-kind';
import { readConfig } from '@/config/read-config';
import { updateConfig } from '@/config/update-config';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { dimText, formatSuccessLine } from '@/output/style';
import { TARGET_ENVIRONMENT_VARIABLE } from '@/target/constants/target-environment-variable.constant';
import { findRemote } from '@/target/find-remote';
import { selectTarget } from '@/target/select-target';

export const runAuthLogoutCommand: CommandRun = async ({
  options,
  output,
  signal,
}) => {
  const configPath = getConfigPath();
  const selection = await selectTarget({
    environment: process.env,
    remoteFlag: readStringOption(options, 'remote'),
    loadConfig: () => readConfig(configPath),
    warn: output.warn,
  });

  if (selection.source === 'environment') {
    throw new CliError({
      code: 'USAGE',
      exitCode: EXIT_CODE.USAGE,
      message: `${TARGET_ENVIRONMENT_VARIABLE.API_URL} and ${TARGET_ENVIRONMENT_VARIABLE.API_KEY} are not saved, so there is nothing to sign out of.`,
      hint: 'Unset them in your shell, or pick a saved remote with --remote.',
    });
  }

  const { remoteName } = selection;
  const hadCredentials = await updateConfig({
    configPath,
    signal,
    update: (config) => {
      const remote = findRemote(config, remoteName);
      const {
        apiKey: _apiKey,
        twentyCLIAccessToken: _accessToken,
        twentyCLIRefreshToken: _refreshToken,
        ...remoteWithoutCredentials
      } = remote;

      return {
        result: getCredentialKind(remote) !== 'none',
        config: {
          ...config,
          remotes: {
            ...config.remotes,
            [remoteName]: remoteWithoutCredentials,
          },
        },
      };
    },
  });

  return {
    data: { remote: remoteName, wasSignedIn: hadCredentials },
    human: hadCredentials
      ? [
          formatSuccessLine(`Signed out of ${remoteName}.`),
          dimText(
            `  The remote stays; sign in with twenty auth login --remote ${remoteName} --with-token`,
          ),
        ].join('\n')
      : `${remoteName} was already signed out.`,
  };
};
