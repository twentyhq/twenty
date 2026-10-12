import { type LocalCommandDefinition } from '@/catalog/types/command-definition.type';

export const REMOTE_LIST_COMMAND_DEFINITION: LocalCommandDefinition = {
  path: ['remote', 'list'],
  description: 'List saved remotes',
  outputModes: ['human', 'json'],
  writes: false,
  needsProject: false,
  needsTarget: false,
  load: async () =>
    (await import('@/commands/remote/list/run-remote-list-command'))
      .runRemoteListCommand,
};
