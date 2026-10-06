import { readStringArgument } from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { getConfigPath } from '@/config/get-config-path';
import { updateConfig } from '@/config/update-config';
import { dimText, formatSuccessLine } from '@/output/style';
import { findRemote } from '@/target/find-remote';

export const runRemoteUseCommand: CommandRun = async ({
  arguments: commandArguments,
  signal,
}) => {
  const remoteName = readStringArgument(commandArguments, 0) ?? '';
  const remote = await updateConfig({
    configPath: getConfigPath(),
    signal,
    update: (config) => ({
      result: findRemote(config, remoteName),
      config: { ...config, defaultRemote: remoteName },
    }),
  });

  return {
    data: { defaultRemote: remoteName, apiUrl: remote.apiUrl },
    human: formatSuccessLine(
      `Default remote is now ${remoteName} ${dimText(`(${remote.apiUrl})`)}`,
    ),
  };
};
