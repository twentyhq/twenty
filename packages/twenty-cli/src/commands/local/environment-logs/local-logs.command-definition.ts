import { type LocalCommandDefinition } from '@/catalog/types/command-definition.type';

export const LOCAL_LOGS_COMMAND_DEFINITION: LocalCommandDefinition = {
  path: ['local', 'logs'],
  description: 'Stream local environment logs',
  options: [
    {
      flags: '-n, --lines <lines>',
      description: 'Number of recent log lines (default: 50, maximum: 10000)',
    },
    {
      flags: '--no-follow',
      description: 'Print recent logs and exit',
    },
    {
      flags: '--test',
      description: 'Use the separate local test instance',
    },
  ],
  examples: ['twenty local logs', 'twenty local logs --test --no-follow'],
  outputModes: ['human', 'ndjson'],
  writes: false,
  needsProject: false,
  needsTarget: false,
  load: async () =>
    (await import('@/commands/local/environment-logs/run-local-logs-command'))
      .runLocalLogsCommand,
};
