import { type LocalCommandDefinition } from '@/catalog/types/command-definition.type';

export const REMOTE_RENAME_COMMAND_DEFINITION: LocalCommandDefinition = {
  path: ['remote', 'rename'],
  description: 'Rename a saved remote',
  arguments: [
    { name: 'current', description: 'Current name', required: true },
    { name: 'new', description: 'New name', required: true },
  ],
  outputModes: ['human', 'json'],
  writes: true,
  needsProject: false,
  needsTarget: false,
  load: async () =>
    (await import('@/commands/remote/rename/run-remote-rename-command'))
      .runRemoteRenameCommand,
};
