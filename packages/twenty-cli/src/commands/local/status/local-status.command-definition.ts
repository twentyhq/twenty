import { type LocalCommandDefinition } from '@/catalog/types/command-definition.type';

export const LOCAL_STATUS_COMMAND_DEFINITION: LocalCommandDefinition = {
  path: ['local', 'status'],
  description: 'Show local environment status, URL and image',
  options: [
    {
      flags: '--test',
      description: 'Use the separate local test instance',
    },
  ],
  examples: ['twenty local status --json'],
  outputModes: ['human', 'json'],
  writes: false,
  needsProject: false,
  needsTarget: false,
  load: async () =>
    (await import('@/commands/local/status/run-local-status-command'))
      .runLocalStatusCommand,
};
