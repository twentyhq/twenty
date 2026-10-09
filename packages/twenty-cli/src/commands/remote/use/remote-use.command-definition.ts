import { type LocalCommandDefinition } from '@/catalog/types/command-definition.type';

export const REMOTE_USE_COMMAND_DEFINITION: LocalCommandDefinition = {
  path: ['remote', 'use'],
  description: 'Make a saved remote the default',
  arguments: [{ name: 'name', description: 'Saved remote', required: true }],
  outputModes: ['human', 'json'],
  writes: true,
  needsProject: false,
  needsTarget: false,
  load: async () =>
    (await import('@/commands/remote/use/run-remote-use-command'))
      .runRemoteUseCommand,
};
