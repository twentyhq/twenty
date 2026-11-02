import { type LocalCommandDefinition } from '@/catalog/types/command-definition.type';

export const LOCAL_RESET_COMMAND_DEFINITION: LocalCommandDefinition = {
  path: ['local', 'reset'],
  description: 'Delete the local environment and all its data',
  options: [
    {
      flags: '--yes',
      description: 'Delete the local environment and its data without asking',
    },
    {
      flags: '--test',
      description: 'Use the separate local test instance',
    },
  ],
  examples: ['twenty local reset', 'twenty local reset --test --yes'],
  outputModes: ['human', 'json'],
  writes: true,
  needsProject: false,
  needsTarget: false,
  load: async () =>
    (await import('@/commands/local/reset/run-local-reset-command'))
      .runLocalResetCommand,
};
