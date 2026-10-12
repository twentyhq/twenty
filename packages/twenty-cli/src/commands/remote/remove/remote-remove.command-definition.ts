import { type LocalCommandDefinition } from '@/catalog/types/command-definition.type';

export const REMOTE_REMOVE_COMMAND_DEFINITION: LocalCommandDefinition = {
  path: ['remote', 'remove'],
  description: 'Remove a saved remote and its credentials',
  arguments: [{ name: 'name', description: 'Saved remote', required: true }],
  outputModes: ['human', 'json'],
  writes: true,
  needsProject: false,
  needsTarget: false,
  load: async () =>
    (await import('@/commands/remote/remove/run-remote-remove-command'))
      .runRemoteRemoveCommand,
};
