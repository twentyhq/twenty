import { readStringArgument } from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { getConfigPath } from '@/config/get-config-path';
import { updateConfig } from '@/config/update-config';
import { validateRemoteName } from '@/config/validate-remote-name';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { formatSuccessLine } from '@/output/style';
import { findRemote } from '@/target/find-remote';

export const runRemoteRenameCommand: CommandRun = async ({
  arguments: commandArguments,
  signal,
}) => {
  const currentName = readStringArgument(commandArguments, 0) ?? '';
  const newName = validateRemoteName(
    readStringArgument(commandArguments, 1) ?? '',
  );

  const isDefault = await updateConfig({
    configPath: getConfigPath(),
    signal,
    update: (config) => {
      const remote = findRemote(config, currentName);

      if (Object.hasOwn(config.remotes, newName)) {
        throw new CliError({
          code: 'REMOTE_EXISTS',
          exitCode: EXIT_CODE.USAGE,
          message: `A remote named ${newName} already exists.`,
          hint: `Pick another name, or remove it first: twenty remote remove ${newName}`,
        });
      }

      const { [currentName]: _renamedRemote, ...otherRemotes } = config.remotes;
      const wasDefault = config.defaultRemote === currentName;

      return {
        result: wasDefault,
        config: {
          ...config,
          remotes: { ...otherRemotes, [newName]: remote },
          ...(wasDefault ? { defaultRemote: newName } : {}),
        },
      };
    },
  });

  return {
    data: { previousName: currentName, name: newName, isDefault },
    human: formatSuccessLine(`Renamed ${currentName} to ${newName}.`),
  };
};
