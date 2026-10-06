import { HELP_GROUP } from '@/catalog/constants/help-group.constant';
import { type LocalCommandDefinition } from '@/catalog/types/command-definition.type';

export const COMMANDS_COMMAND_DEFINITION: LocalCommandDefinition = {
  path: ['commands'],
  description: 'List the available commands',
  helpGroup: HELP_GROUP.TOOLS,
  outputModes: ['human', 'json'],
  writes: false,
  needsProject: false,
  needsTarget: false,
  load: async () =>
    (await import('@/commands/commands/run-commands-command'))
      .runCommandsCommand,
};
