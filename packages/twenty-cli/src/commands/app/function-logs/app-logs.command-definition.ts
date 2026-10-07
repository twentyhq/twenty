import { type TargetCommandDefinition } from '@/catalog/types/command-definition.type';

export const APP_LOGS_COMMAND_DEFINITION: TargetCommandDefinition = {
  path: ['app', 'logs'],
  description: 'Watch new logic-function logs from this app',
  options: [
    {
      flags: '--path <directory>',
      description:
        'App directory (default: the app containing the current folder)',
    },
    {
      flags: '--name <name>',
      description: 'Filter all functions with this exact name within the app',
    },
    {
      flags: '--universal-identifier <id>',
      description: 'Filter one function by universal identifier',
    },
  ],
  examples: [
    'twenty app logs --remote dev',
    'twenty app logs --name add-numbers --remote dev',
    'twenty app logs --format ndjson',
  ],
  outputModes: ['human', 'ndjson'],
  writes: false,
  needsProject: true,
  needsTarget: true,
  requiredPermissions: ['WORKFLOWS'],
  load: async () =>
    (await import('@/commands/app/function-logs/run-app-logs-command'))
      .runAppLogsCommand,
};
