import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type ConfigFile } from '@/config/types/config-file.type';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { formatList } from '@/output/format-list';
import { type CliWarning } from '@/output/types/cli-warning.type';
import { TARGET_ENVIRONMENT_VARIABLE } from '@/target/constants/target-environment-variable.constant';
import { findRemote } from '@/target/find-remote';
import { type TargetSelection } from '@/target/types/target-selection.type';

const readEnvironmentValue = (
  environment: NodeJS.ProcessEnv,
  variableName: string,
) => {
  const value = environment[variableName]?.trim();

  return isNonEmptyString(value) ? value : undefined;
};

const selectRemote = (
  config: ConfigFile,
  remoteName: string,
): TargetSelection => ({
  source: 'remote',
  remoteName,
  remote: findRemote(config, remoteName),
});

export const selectTarget = async ({
  environment,
  remoteFlag,
  loadConfig,
  warn,
}: {
  environment: NodeJS.ProcessEnv;
  remoteFlag: string | undefined;
  loadConfig: () => Promise<ConfigFile>;
  warn: (warning: CliWarning) => void;
}): Promise<TargetSelection> => {
  const environmentRemote = readEnvironmentValue(
    environment,
    TARGET_ENVIRONMENT_VARIABLE.REMOTE,
  );
  const apiUrl = readEnvironmentValue(
    environment,
    TARGET_ENVIRONMENT_VARIABLE.API_URL,
  );
  const apiKey = readEnvironmentValue(
    environment,
    TARGET_ENVIRONMENT_VARIABLE.API_KEY,
  );

  if (isDefined(remoteFlag)) {
    const ignoredVariables = Object.values(TARGET_ENVIRONMENT_VARIABLE).filter(
      (variableName) =>
        isDefined(readEnvironmentValue(environment, variableName)),
    );

    if (isNonEmptyArray(ignoredVariables)) {
      warn({
        code: 'ENVIRONMENT_TARGET_IGNORED',
        message: `Using remote ${remoteFlag}. Ignoring ${formatList(ignoredVariables)}.`,
      });
    }

    return selectRemote(await loadConfig(), remoteFlag);
  }

  if (isDefined(environmentRemote)) {
    if (isDefined(apiUrl) || isDefined(apiKey)) {
      throw new CliError({
        code: 'CONFLICTING_TARGET',
        exitCode: EXIT_CODE.USAGE,
        message: `${TARGET_ENVIRONMENT_VARIABLE.REMOTE} cannot be combined with ${TARGET_ENVIRONMENT_VARIABLE.API_URL} or ${TARGET_ENVIRONMENT_VARIABLE.API_KEY}.`,
        hint: 'Unset one of them, or choose with --remote.',
      });
    }

    return selectRemote(await loadConfig(), environmentRemote);
  }

  if (isDefined(apiUrl) !== isDefined(apiKey)) {
    const missingVariable = isDefined(apiUrl)
      ? TARGET_ENVIRONMENT_VARIABLE.API_KEY
      : TARGET_ENVIRONMENT_VARIABLE.API_URL;

    throw new CliError({
      code: 'INCOMPLETE_TARGET',
      exitCode: EXIT_CODE.USAGE,
      message: `${missingVariable} is not set.`,
      hint: `Set both ${TARGET_ENVIRONMENT_VARIABLE.API_URL} and ${TARGET_ENVIRONMENT_VARIABLE.API_KEY}, or neither.`,
    });
  }

  if (isDefined(apiUrl) && isDefined(apiKey)) {
    return { source: 'environment', apiUrl, apiKey };
  }

  const config = await loadConfig();

  if (isDefined(config.defaultRemote)) {
    return selectRemote(config, config.defaultRemote);
  }

  throw new CliError({
    code: 'TARGET_REQUIRED',
    exitCode: EXIT_CODE.USAGE,
    message: 'No workspace selected.',
    hint: `Sign in with: twenty auth login --with-token --url <url> --name <name>. Or set ${TARGET_ENVIRONMENT_VARIABLE.API_URL} and ${TARGET_ENVIRONMENT_VARIABLE.API_KEY}.`,
  });
};
