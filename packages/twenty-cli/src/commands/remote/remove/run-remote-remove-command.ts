import { readStringArgument } from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { getConfigPath } from '@/config/get-config-path';
import { updateConfig } from '@/config/update-config';
import { dimText, formatSuccessLine } from '@/output/style';
import { findRemote } from '@/target/find-remote';

export const runRemoteRemoveCommand: CommandRun = async ({
  arguments: commandArguments,
  signal,
}) => {
  const remoteName = readStringArgument(commandArguments, 0) ?? '';

  const wasDefault = await updateConfig({
    configPath: getConfigPath(),
    signal,
    update: (config) => {
      findRemote(config, remoteName);

      const { [remoteName]: _removedRemote, ...remotes } = config.remotes;
      const { defaultRemote, ...configWithoutDefault } = config;
      const isRemovingDefault = defaultRemote === remoteName;

      return {
        result: isRemovingDefault,
        config: {
          ...(isRemovingDefault ? configWithoutDefault : config),
          remotes,
        },
      };
    },
  });

  return {
    data: { removed: remoteName, wasDefault },
    human: [
      formatSuccessLine(`Removed ${remoteName}.`),
      ...(wasDefault
        ? [
            dimText(
              '  There is no default remote now. Pick one with: twenty remote use <name>',
            ),
          ]
        : []),
    ].join('\n'),
  };
};
