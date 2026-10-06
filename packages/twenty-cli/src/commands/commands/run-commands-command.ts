import { isDefined } from 'twenty-shared/utils';

import { COMMAND_CATALOG } from '@/catalog/command-catalog';
import { getCommandName } from '@/catalog/get-command-name';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { formatTable } from '@/output/format-table';
import { dimText } from '@/output/style';
import { GLOBAL_FLAGS } from '@/program/constants/global-flags.constant';

export const runCommandsCommand: CommandRun = async () => {
  const commands = COMMAND_CATALOG.map((definition) => ({
    name: getCommandName(definition),
    description: definition.description,
    arguments: (definition.arguments ?? []).map(({ name, required }) => ({
      name,
      required,
    })),
    flags: (definition.options ?? [])
      .filter(({ hidden }) => hidden !== true)
      .map(({ flags }) => flags),
    outputs: definition.outputModes,
    writes: definition.writes,
    needsProject: definition.needsProject,
    needsTarget: definition.needsTarget,
    ...(isDefined(definition.requiredPermissions)
      ? { requiredPermissions: definition.requiredPermissions }
      : {}),
  })).sort((first, second) => first.name.localeCompare(second.name));

  return {
    data: { commands, globalFlags: Object.values(GLOBAL_FLAGS) },
    human: [
      formatTable({
        rows: commands,
        columns: [
          { header: 'COMMAND', value: (command) => command.name },
          { header: 'DESCRIPTION', value: (command) => command.description },
        ],
      }),
      dimText(`${commands.length} commands · details: twenty <command> --help`),
    ].join('\n'),
  };
};
