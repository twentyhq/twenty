import { type LocalCommandDefinition } from '@/catalog/types/command-definition.type';

export const LOCAL_STOP_COMMAND_DEFINITION: LocalCommandDefinition = {
  path: ['local', 'stop'],
  description: 'Stop the local environment, preserving its data',
  options: [
    {
      flags: '--test',
      description: 'Use the separate local test instance',
    },
  ],
  examples: ['twenty local stop'],
  outputModes: ['human', 'json'],
  writes: true,
  needsProject: false,
  needsTarget: false,
  load: async () =>
    (await import('@/commands/local/stop/run-local-stop-command'))
      .runLocalStopCommand,
};
